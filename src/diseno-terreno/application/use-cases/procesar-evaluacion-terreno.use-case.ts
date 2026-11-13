import { Inject, Injectable, Logger } from '@nestjs/common';
import { EvaluacionTerreno } from '../../domain/entities/evaluacion-terreno.entity';
import type { ProveedorClimaPort, ProveedorObjetosPort, ProveedorSueloPort } from '../../domain/ports/proveedores-geo.port';
import { PROVEEDOR_CLIMA_TOKEN, PROVEEDOR_OBJETOS_TOKEN, PROVEEDOR_SUELO_TOKEN } from '../../domain/ports/proveedores-geo.port';
import type { CultivoAptitudRepositoryPort, EvaluacionTerrenoRepositoryPort } from '../../domain/ports/repositorios.port';
import { CULTIVO_APTITUD_REPOSITORY_TOKEN, EVALUACION_TERRENO_REPOSITORY_TOKEN } from '../../domain/ports/repositorios.port';
import { DisenadorSiembra, DisenoSiembra } from '../../domain/services/disenador-siembra.service';
import { AptitudCultivo, EvaluadorAptitud } from '../../domain/services/evaluador-aptitud.service';
import { areaPoligonoM2, centroide } from '../../domain/value-objects/geo';
import { FuenteObjeto, ObjetoTerreno, recortarObjetosAlArea, ResumenObjetos, resumirObjetos, TipoObjeto } from '../../domain/value-objects/objetos-terreno';
import { CoberturaTerreno, PerfilTerreno, porcentajeSembrable } from '../../domain/value-objects/perfil-terreno.vo';
import type { TipoCoberturaVisual } from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import { AnalizadorCoberturaService } from '../services/analizador-cobertura.service';
import { AnalizadorTopografiaService } from '../services/analizador-topografia.service';
import { DetectorObjetosDronService } from '../services/detector-objetos-dron.service';

const DISENOS_SUGERIDOS = 3;
const CLASES_CON_DISENO = ['ALTA', 'MODERADA', 'MARGINAL'];

const AREA_DRON_SUFICIENTE_PCT = 80;
const FUENTE_OBJETOS = 'Casas, vías y árboles (OpenStreetMap y Microsoft)';
const FUENTE_IA_DRON = 'Detección con IA en las fotos del dron';

const NOMBRES_FUENTE: Record<FuenteObjeto, string> = {
  OSM: 'OpenStreetMap',
  MICROSOFT: 'Microsoft (edificios)',
  IA_DRON: 'la IA en las fotos del dron',
};

const OBJETO_A_COBERTURA: Record<TipoObjeto, TipoCoberturaVisual> = {
  CONSTRUCCION: 'CONSTRUCCION',
  VIA: 'VIA',
  AGUA: 'AGUA',
  BOSQUE: 'BOSQUE',
  ARBOL: 'BOSQUE',
};

const NOMBRES_OBJETO: Record<TipoObjeto, [string, string]> = {
  CONSTRUCCION: ['construcción', 'construcciones'],
  VIA: ['tramo de vía', 'tramos de vía'],
  AGUA: ['cuerpo de agua', 'cuerpos de agua'],
  BOSQUE: ['zona de bosque', 'zonas de bosque'],
  ARBOL: ['árbol o hilera de árboles', 'árboles o hileras de árboles'],
};

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
    @Inject(PROVEEDOR_OBJETOS_TOKEN)
    private readonly objetosMapa: ProveedorObjetosPort,
    private readonly detectorDron: DetectorObjetosDronService,
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
      const coberturaBase = await this.obtenerCobertura(evaluacion, advertencias, intentar);
      const vueloId = evaluacion.vueloId;
      const [deMapas, deDron] = await Promise.all([
        intentar(FUENTE_OBJETOS, () => this.objetosMapa.obtenerObjetos(poligono)),
        vueloId ? intentar(FUENTE_IA_DRON, () => this.detectorDron.detectar(vueloId)) : Promise.resolve(null),
      ]);
      for (const falla of deMapas?.fallas ?? []) {
        fuentesFallidas.push(falla.fuente);
        advertencias.push(`No se pudo obtener ${falla.fuente.toLowerCase()}: ${falla.mensaje}`);
      }
      const objetos = recortarObjetosAlArea([...(deMapas?.objetos ?? []), ...(deDron ?? [])], poligono);
      const resumenObjetos = objetos.length > 0 ? resumirObjetos(poligono, objetos) : null;
      const cobertura = this.ajustarConObjetos(coberturaBase, resumenObjetos);
      if (deMapas !== null || deDron !== null) {
        advertencias.push(
          resumenObjetos
            ? `Según ${this.describirFuentes(objetos)} hay ${this.describirConteo(objetos)}, que ocupan el ${resumenObjetos.porcentajeOcupado} % del terreno. El diseño no pasa por ahí.`
            : 'No se encontraron casas, vías, agua ni árboles dentro de este terreno; se usó solo lo que vio el dron o el satélite.',
        );
      }

      const perfil: PerfilTerreno = {
        ubicacion,
        areaM2: Math.round(areaPoligonoM2(poligono)),
        topografia,
        clima,
        suelo,
        cobertura,
        objetos,
        resumenObjetos,
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
      const vueloId = evaluacion.vueloId;
      const deDron = await intentar('Cobertura con dron', () => this.cobertura.desdeDron(loteId, vueloId, evaluacion.poligono));
      if (deDron && evaluacion.areaDelVuelo) return { ...deDron, areaVerificadaPct: 100 };
      if (deDron && deDron.areaVerificadaPct >= AREA_DRON_SUFICIENTE_PCT) return deDron;
      if (deDron) {
        const deSatelite =
          evaluacion.usarSatelite && this.cobertura.satelitalDisponible()
            ? await intentar('Cobertura satelital', () => this.cobertura.desdeSatelite(evaluacion.poligono))
            : null;
        if (deSatelite) {
          advertencias.push(`Las fotos del dron solo cubren el ${deDron.areaVerificadaPct} % del terreno; el resto se completó con la imagen satelital.`);
          return this.cobertura.combinar(deDron, deSatelite);
        }
        advertencias.push(
          `Las fotos del dron solo cubren el ${deDron.areaVerificadaPct} % del terreno y el resto no se pudo verificar: la aptitud máxima queda en moderada. Haz un vuelo que cubra todo el lote para un resultado completo.`,
        );
        return this.cobertura.completarSinVerificar(deDron);
      }
      advertencias.push(
        vueloId
          ? `El vuelo #${vueloId} no tiene un análisis completado en este lote; se usó la imagen satelital.`
          : 'El lote no tiene vuelos de dron analizados; se usó la imagen satelital.',
      );
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

  private ajustarConObjetos(cobertura: CoberturaTerreno | null, resumen: ResumenObjetos | null): CoberturaTerreno | null {
    if (!resumen) return cobertura;
    const libreSegunMapa = Math.max(0, Math.round(100 - resumen.porcentajeOcupado));
    if (!cobertura) {
      const porcentajes: Partial<Record<TipoCoberturaVisual, number>> = {};
      for (const [tipo, valor] of Object.entries(resumen.porcentajes) as [TipoObjeto, number][]) {
        const visual = OBJETO_A_COBERTURA[tipo];
        porcentajes[visual] = Math.round(((porcentajes[visual] ?? 0) + valor) * 10) / 10;
      }
      return {
        fuente: 'MAPA',
        porcentajes,
        porcentajeSembrable: libreSegunMapa,
        areaVerificadaPct: 0,
        observaciones: ['Solo se conocen las casas, vías, agua y árboles detectados; el resto del terreno no se verificó.'],
        zonas: [],
        zonasExcluidas: [],
        cultivosExistentes: [],
        fecha: null,
        referencia: 'Mapas y detección de objetos',
      };
    }
    const porcentajes = { ...cobertura.porcentajes };
    const delMapa: Partial<Record<TipoCoberturaVisual, number>> = {};
    for (const [tipo, valor] of Object.entries(resumen.porcentajes) as [TipoObjeto, number][]) {
      const visual = OBJETO_A_COBERTURA[tipo];
      delMapa[visual] = (delMapa[visual] ?? 0) + valor;
    }
    for (const [visual, valor] of Object.entries(delMapa) as [TipoCoberturaVisual, number][]) {
      porcentajes[visual] = Math.round(Math.max(porcentajes[visual] ?? 0, valor) * 10) / 10;
    }
    return {
      ...cobertura,
      porcentajes,
      porcentajeSembrable: Math.min(cobertura.porcentajeSembrable, porcentajeSembrable(porcentajes), libreSegunMapa),
    };
  }

  private describirFuentes(objetos: ObjetoTerreno[]): string {
    const nombres = [...new Set(objetos.map((o) => o.fuente).filter((f): f is FuenteObjeto => !!f))].map((f) => NOMBRES_FUENTE[f]);
    if (nombres.length === 0) return 'los mapas';
    return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0];
  }

  private describirConteo(objetos: ObjetoTerreno[]): string {
    const conteo = new Map<TipoObjeto, number>();
    for (const o of objetos.filter((o) => o.fuente !== 'IA_DRON')) conteo.set(o.tipo, (conteo.get(o.tipo) ?? 0) + 1);
    const partes = [...conteo.entries()].map(([tipo, n]) => `${n} ${NOMBRES_OBJETO[tipo][n === 1 ? 0 : 1]}`);
    const celdasIa = objetos.filter((o) => o.fuente === 'IA_DRON').length;
    if (celdasIa > 0) partes.push(`${celdasIa} ${celdasIa === 1 ? 'zona marcada' : 'zonas marcadas'} por la IA en las fotos`);
    return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0] ?? 'objetos';
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
    const existentes = perfil.cobertura?.cultivosExistentes ?? [];
    if (existentes.length > 0) {
      advertencias.push(
        `Ya hay cultivo sembrado: ${existentes.map((c) => `${c.nombre} (${c.capturas} ${c.capturas === 1 ? 'foto' : 'fotos'})`).join(', ')}. El diseño no ocupa esas zonas.`,
      );
    }
    const noSembrables = (perfil.cobertura?.zonas ?? []).filter((z) => z.tipo === 'NO_SEMBRABLE').length;
    if (noSembrables > 0) {
      advertencias.push(`Se marcaron ${noSembrables} zonas donde no se puede sembrar (construcciones, vías o agua). Revisa la lista en el mapa.`);
    }
    if (perfil.cobertura) advertencias.push(...perfil.cobertura.observaciones);
    advertencias.push('Datos de clima y suelo son modelos globales (resolución 250 m – 10 km). Confirma el pH con un análisis de suelo de laboratorio.');
    return advertencias;
  }
}
