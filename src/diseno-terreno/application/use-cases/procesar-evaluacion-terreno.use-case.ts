import { Inject, Injectable, Logger } from '@nestjs/common';
import { EvaluacionTerreno } from '../../domain/entities/evaluacion-terreno.entity';
import type { ProveedorClimaPort, ProveedorSueloPort } from '../../domain/ports/proveedores-geo.port';
import { PROVEEDOR_CLIMA_TOKEN, PROVEEDOR_SUELO_TOKEN } from '../../domain/ports/proveedores-geo.port';
import type { CultivoAptitudRepositoryPort, EvaluacionTerrenoRepositoryPort } from '../../domain/ports/repositorios.port';
import { CULTIVO_APTITUD_REPOSITORY_TOKEN, EVALUACION_TERRENO_REPOSITORY_TOKEN } from '../../domain/ports/repositorios.port';
import { DisenadorSiembra, DisenoSiembra } from '../../domain/services/disenador-siembra.service';
import { AptitudCultivo, EvaluadorAptitud } from '../../domain/services/evaluador-aptitud.service';
import { areaPoligonoM2, centroide } from '../../domain/value-objects/geo';
import { CoberturaTerreno, PerfilTerreno } from '../../domain/value-objects/perfil-terreno.vo';
import { AnalizadorCoberturaService } from '../services/analizador-cobertura.service';
import { AnalizadorTopografiaService } from '../services/analizador-topografia.service';

const DISENOS_SUGERIDOS = 3;
const CLASES_CON_DISENO = ['ALTA', 'MODERADA', 'MARGINAL'];

@Injectable()
export class ProcesarEvaluacionTerrenoUseCase {
  private readonly logger = new Logger(ProcesarEvaluacionTerrenoUseCase.name);

  constructor(
    @Inject(EVALUACION_TERRENO_REPOSITORY_TOKEN)
    private readonly evaluacionRepository: EvaluacionTerrenoRepositoryPort,
    @Inject(CULTIVO_APTITUD_REPOSITORY_TOKEN)
    private readonly cultivoRepository: CultivoAptitudRepositoryPort,
    @Inject(PROVEEDOR_CLIMA_TOKEN)
    private readonly clima: ProveedorClimaPort,
    @Inject(PROVEEDOR_SUELO_TOKEN)
    private readonly suelo: ProveedorSueloPort,
    private readonly topografia: AnalizadorTopografiaService,
    private readonly cobertura: AnalizadorCoberturaService,
  ) {}

  async execute(evaluacionId: number): Promise<void> {
    const evaluacion = await this.evaluacionRepository.buscarPorId(evaluacionId);
    if (!evaluacion) return;

    const advertencias: string[] = [];
    const fuentesFallidas: string[] = [];
    const registrarFallo = (fuente: string, error: unknown) => {
      const mensaje = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Evaluación ${evaluacionId} – ${fuente}: ${mensaje}`);
      fuentesFallidas.push(fuente);
      advertencias.push(`No se pudo obtener ${fuente.toLowerCase()}: ${mensaje}`);
    };
    const intentar = async <T>(fuente: string, tarea: () => Promise<T | null>): Promise<T | null> => {
      try {
        return await tarea();
      } catch (error) {
        registrarFallo(fuente, error);
        return null;
      }
    };

    try {
      const poligono = evaluacion.poligono;
      const ubicacion = centroide(poligono);

      await this.avanzar(evaluacion, 'TOPOGRAFIA');
      const topografia = await intentar('Topografía', () => this.topografia.analizar(poligono));

      await this.avanzar(evaluacion, 'CLIMA_Y_SUELO');
      const [clima, suelo] = await Promise.all([
        intentar('Clima', () => this.clima.obtenerClima(ubicacion, topografia?.altitudPromedioM ?? null)),
        intentar('Suelo', () => this.suelo.obtenerSuelo(ubicacion)),
      ]);

      await this.avanzar(evaluacion, 'COBERTURA');
      const cobertura = await this.obtenerCobertura(evaluacion, advertencias, intentar);

      const perfil: PerfilTerreno = {
        ubicacion,
        areaM2: Math.round(areaPoligonoM2(poligono)),
        topografia,
        clima,
        suelo,
        cobertura,
        fuentesFallidas,
      };

      await this.avanzar(evaluacion, 'APTITUD');
      const cultivos = await this.cultivoRepository.listarActivos();
      const ranking = EvaluadorAptitud.evaluar(perfil, cultivos);

      await this.avanzar(evaluacion, 'DISENO');
      const disenos = this.disenar(evaluacion, perfil, ranking, cultivos);
      advertencias.push(...this.advertenciasGenerales(perfil, ranking));

      evaluacion.completar(perfil, ranking, disenos, advertencias);
      await this.evaluacionRepository.guardar(evaluacion);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Evaluación ${evaluacionId} falló: ${mensaje}`);
      evaluacion.fallar(mensaje);
      await this.evaluacionRepository.guardar(evaluacion);
    }
  }

  private async avanzar(evaluacion: EvaluacionTerreno, etapa: Parameters<EvaluacionTerreno['avanzar']>[0]): Promise<void> {
    evaluacion.avanzar(etapa);
    await this.evaluacionRepository.guardar(evaluacion);
  }

  private async obtenerCobertura(
    evaluacion: EvaluacionTerreno,
    advertencias: string[],
    intentar: <T>(fuente: string, tarea: () => Promise<T | null>) => Promise<T | null>,
  ): Promise<CoberturaTerreno | null> {
    if (evaluacion.usarDron && evaluacion.loteId) {
      const loteId = evaluacion.loteId;
      const deDron = await intentar('Cobertura con dron', () => this.cobertura.desdeDron(loteId));
      if (deDron) return deDron;
      advertencias.push('El lote no tiene vuelos de dron analizados; se usó la imagen satelital.');
    }
    if (evaluacion.usarSatelite) {
      if (!this.cobertura.satelitalDisponible()) {
        advertencias.push('No hay GOOGLE_MAPS_API_KEY configurada: no se verificó qué hay sobre el terreno.');
        return null;
      }
      return intentar('Cobertura satelital', () => this.cobertura.desdeSatelite(evaluacion.poligono));
    }
    return null;
  }

  private disenar(
    evaluacion: EvaluacionTerreno,
    perfil: PerfilTerreno,
    ranking: AptitudCultivo[],
    cultivos: Awaited<ReturnType<CultivoAptitudRepositoryPort['listarActivos']>>,
  ): DisenoSiembra[] {
    const codigos = ranking
      .filter((r) => CLASES_CON_DISENO.includes(r.clase))
      .slice(0, DISENOS_SUGERIDOS)
      .map((r) => r.codigo);
    if (evaluacion.cultivoPreferido && !codigos.includes(evaluacion.cultivoPreferido)) {
      codigos.unshift(evaluacion.cultivoPreferido);
    }
    return codigos
      .map((codigo) => cultivos.find((c) => c.codigo === codigo))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .map((cultivo) => DisenadorSiembra.disenar(evaluacion.poligono, perfil, cultivo));
  }

  private advertenciasGenerales(perfil: PerfilTerreno, ranking: AptitudCultivo[]): string[] {
    const advertencias: string[] = [];
    if (!ranking.some((r) => r.clase === 'ALTA' || r.clase === 'MODERADA')) {
      advertencias.push('Ningún cultivo del catálogo tiene aptitud alta o moderada para este terreno.');
    }
    if (perfil.cobertura?.porcentajes.BOSQUE && perfil.cobertura.porcentajes.BOSQUE >= 10) {
      advertencias.push(
        `Hay ${perfil.cobertura.porcentajes.BOSQUE} % de bosque o rastrojo: no se contó como sembrable. Talar requiere permiso de la corporación autónoma regional.`,
      );
    }
    if (perfil.topografia && perfil.topografia.altitudMaxM - perfil.topografia.altitudMinM > 150) {
      advertencias.push('El terreno tiene más de 150 m de desnivel: conviene dividirlo en sublotes por altura.');
    }
    if (perfil.cobertura) advertencias.push(...perfil.cobertura.observaciones);
    advertencias.push('Datos de clima y suelo son modelos globales (resolución 250 m – 10 km). Confirma el pH con un análisis de suelo de laboratorio.');
    return advertencias;
  }
}
