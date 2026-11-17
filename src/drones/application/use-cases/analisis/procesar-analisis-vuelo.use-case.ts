import { Inject, Injectable, Logger } from '@nestjs/common';
import { AnalisisVuelo, ResumenIndices } from '../../../domain/entities/analisis-vuelo.entity';
import { Captura } from '../../../domain/entities/captura.entity';
import { ResultadoCaptura } from '../../../domain/entities/resultado-captura.entity';
import type { AlmacenamientoArchivosPort } from '../../../domain/ports/almacenamiento-archivos.port';
import { ALMACENAMIENTO_ARCHIVOS_TOKEN } from '../../../domain/ports/almacenamiento-archivos.token';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/analisis-vuelo.repository.token';
import type { CapturaRepositoryPort } from '../../../domain/ports/captura.repository.port';
import { CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/captura.repository.token';
import type { CapturaInterpretada, InterpreteAgronomicoPort } from '../../../domain/ports/interprete-agronomico.port';
import { INTERPRETE_AGRONOMICO_TOKEN } from '../../../domain/ports/interprete-agronomico.token';
import type { BandasParaProcesar, ProcesadorMultiespectralPort } from '../../../domain/ports/procesador-multiespectral.port';
import { PROCESADOR_MULTIESPECTRAL_TOKEN } from '../../../domain/ports/procesador-multiespectral.token';
import type { ResultadoCapturaRepositoryPort } from '../../../domain/ports/resultado-captura.repository.port';
import { RESULTADO_CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/resultado-captura.repository.token';
import type { VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';
import { CalculadoraResumenAnalisis } from '../../../domain/services/calculadora-resumen-analisis.service';
import { BANDAS_MULTIESPECTRALES } from '../../../domain/value-objects/archivo-dji.vo';
import { ResumenInterpretacion, SintesisVuelo } from '../../../domain/value-objects/interpretacion-ia.vo';

const CAPTURAS_POR_GUARDADO_DE_PROGRESO = 10;
const MAXIMO_CAPTURAS_IA = Math.max(1, Number(process.env.DRONES_IA_MAX_CAPTURAS) || 8);

@Injectable()
export class ProcesarAnalisisVueloUseCase {
  private readonly logger = new Logger(ProcesarAnalisisVueloUseCase.name);

  constructor(
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN)
    private readonly analisisRepository: AnalisisVueloRepositoryPort,
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    @Inject(CAPTURA_REPOSITORY_TOKEN)
    private readonly capturaRepository: CapturaRepositoryPort,
    @Inject(RESULTADO_CAPTURA_REPOSITORY_TOKEN)
    private readonly resultadoRepository: ResultadoCapturaRepositoryPort,
    @Inject(ALMACENAMIENTO_ARCHIVOS_TOKEN)
    private readonly almacenamiento: AlmacenamientoArchivosPort,
    @Inject(PROCESADOR_MULTIESPECTRAL_TOKEN)
    private readonly procesador: ProcesadorMultiespectralPort,
    @Inject(INTERPRETE_AGRONOMICO_TOKEN)
    private readonly interprete: InterpreteAgronomicoPort,
  ) {}

  async execute(analisisId: number): Promise<void> {
    const analisis = await this.analisisRepository.buscarPorId(analisisId);
    if (!analisis) return;

    const vuelo = await this.vueloRepository.buscarPorId(analisis.vueloId);
    if (!vuelo) {
      analisis.fallar('El vuelo asociado ya no existe');
      await this.analisisRepository.guardar(analisis);
      return;
    }

    try {
      const capturas = (await this.capturaRepository.listarPorVuelo(analisis.vueloId)).filter((c) => c.completa);
      analisis.iniciar(capturas.length);
      await this.analisisRepository.guardar(analisis);

      const resultados: ResultadoCaptura[] = [];
      let omitidas = 0;

      for (const [indice, captura] of capturas.entries()) {
        try {
          const procesado = await this.procesador.procesar(await this.prepararBandas(captura));
          if (procesado.ndvi.pixelesValidos === 0) {
            omitidas++;
          } else {
            const resultado = ResultadoCaptura.crear(
              { analisisId, capturaId: captura.id as number, ubicacion: captura.ubicacion, ...procesado },
              analisis.umbrales,
            );
            resultados.push(await this.resultadoRepository.guardar(resultado));
          }
        } catch (error) {
          omitidas++;
          this.logger.warn(`Captura ${captura.claveCaptura} omitida: ${this.mensaje(error)}`);
        }

        analisis.registrarProgreso(indice + 1);
        if ((indice + 1) % CAPTURAS_POR_GUARDADO_DE_PROGRESO === 0) {
          await this.analisisRepository.guardar(analisis);
        }
      }

      if (resultados.length === 0) {
        throw new Error('Ninguna captura pudo procesarse; revisa que las imágenes TIF estén completas');
      }

      const resumenIndices = CalculadoraResumenAnalisis.calcular(resultados, analisis.umbrales, omitidas);
      const resumenIa = await this.interpretar(analisis, capturas, resultados, resumenIndices);

      analisis.completar({ ...resumenIndices, ia: resumenIa });
      vuelo.finalizarAnalisis();
    } catch (error) {
      this.logger.error(`Análisis ${analisisId} falló: ${this.mensaje(error)}`);
      analisis.fallar(this.mensaje(error));
      vuelo.marcarError();
    }

    await this.analisisRepository.guardar(analisis);
    await this.vueloRepository.guardar(vuelo);
  }

  private async interpretar(
    analisis: AnalisisVuelo,
    capturas: Captura[],
    resultados: ResultadoCaptura[],
    resumenIndices: ResumenIndices,
  ): Promise<ResumenInterpretacion> {
    if (!analisis.usarIa) {
      return { estado: 'DESACTIVADO', capturasInterpretadas: 0, capturasConError: 0, sintesis: null, mensaje: null };
    }

    const capturasPorId = new Map(capturas.map((c) => [c.id, c]));
    const seleccion = resultados
      .filter((r) => capturasPorId.get(r.capturaId)?.archivos.RGB)
      .sort((a, b) => Number(b.esCritica) - Number(a.esCritica) || a.ndvi.promedio - b.ndvi.promedio)
      .slice(0, MAXIMO_CAPTURAS_IA);

    if (seleccion.length === 0) {
      return {
        estado: 'SIN_RESULTADOS',
        capturasInterpretadas: 0,
        capturasConError: 0,
        sintesis: null,
        mensaje: 'Ninguna captura analizada tiene foto RGB (_D.JPG)',
      };
    }

    analisis.iniciarInterpretacion(seleccion.length);
    await this.analisisRepository.guardar(analisis);

    const interpretadas: CapturaInterpretada[] = [];
    let errores = 0;
    let primerError: string | null = null;

    for (const [indice, resultado] of seleccion.entries()) {
      const captura = capturasPorId.get(resultado.capturaId) as Captura;
      try {
        const archivoRgb = captura.archivos.RGB;
        if (!archivoRgb) throw new Error('La captura no tiene foto RGB');

        const interpretacion = await this.interprete.interpretarCaptura({
          rutaImagenRgb: await this.almacenamiento.obtenerRutaLocal(archivoRgb.ruta),
          altitudRelativaM: captura.altitudRelativaM,
          inclinacionCamaraGrados: captura.inclinacionCamaraGrados,
          contexto: analisis.contexto,
          ndvi: resultado.ndvi,
          ndre: resultado.ndre,
          cobertura: resultado.cobertura,
          distribucionNdvi: resultado.distribucionNdvi,
        });

        resultado.registrarInterpretacion(interpretacion);
        await this.resultadoRepository.guardar(resultado);
        interpretadas.push({
          claveCaptura: captura.claveCaptura,
          ubicacion: captura.ubicacion,
          ndviPromedio: resultado.ndvi.promedio,
          interpretacion,
        });
      } catch (error) {
        errores++;
        primerError ??= this.mensaje(error);
        this.logger.warn(`Interpretación IA de la captura ${captura.claveCaptura} falló: ${this.mensaje(error)}`);
      }

      analisis.registrarInterpretacion(indice + 1);
      await this.analisisRepository.guardar(analisis);
    }

    if (interpretadas.length === 0) {
      return {
        estado: 'SIN_RESULTADOS',
        capturasInterpretadas: 0,
        capturasConError: errores,
        sintesis: null,
        mensaje: primerError,
      };
    }

    let sintesis: SintesisVuelo | null = null;
    try {
      sintesis = await this.interprete.sintetizarVuelo({
        contexto: analisis.contexto,
        resumen: resumenIndices,
        capturas: interpretadas,
      });
    } catch (error) {
      primerError ??= this.mensaje(error);
      this.logger.warn(`Síntesis IA del análisis ${analisis.id} falló: ${this.mensaje(error)}`);
    }

    return {
      estado: errores === 0 && sintesis ? 'COMPLETADO' : 'PARCIAL',
      capturasInterpretadas: interpretadas.length,
      capturasConError: errores,
      sintesis,
      mensaje: primerError,
    };
  }

  private async prepararBandas(captura: Captura): Promise<BandasParaProcesar> {
    const entradas = await Promise.all(
      BANDAS_MULTIESPECTRALES.map(async (banda) => {
        const archivo = captura.archivos[banda];
        if (!archivo) throw new Error(`Falta la banda ${banda}`);
        const rutaLocal = await this.almacenamiento.obtenerRutaLocal(archivo.ruta);
        return [banda, { rutaLocal, calibracion: archivo.calibracion }] as const;
      }),
    );
    return Object.fromEntries(entradas) as BandasParaProcesar;
  }

  private mensaje(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
