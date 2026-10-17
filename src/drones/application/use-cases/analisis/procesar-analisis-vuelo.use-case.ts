import { Inject, Injectable, Logger } from '@nestjs/common';
import { Captura } from '../../../domain/entities/captura.entity';
import { ResultadoCaptura } from '../../../domain/entities/resultado-captura.entity';
import type { AlmacenamientoArchivosPort } from '../../../domain/ports/almacenamiento-archivos.port';
import { ALMACENAMIENTO_ARCHIVOS_TOKEN } from '../../../domain/ports/almacenamiento-archivos.token';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/analisis-vuelo.repository.token';
import type { CapturaRepositoryPort } from '../../../domain/ports/captura.repository.port';
import { CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/captura.repository.token';
import type { BandasParaProcesar, ProcesadorMultiespectralPort } from '../../../domain/ports/procesador-multiespectral.port';
import { PROCESADOR_MULTIESPECTRAL_TOKEN } from '../../../domain/ports/procesador-multiespectral.token';
import type { ResultadoCapturaRepositoryPort } from '../../../domain/ports/resultado-captura.repository.port';
import { RESULTADO_CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/resultado-captura.repository.token';
import type { VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';
import { CalculadoraResumenAnalisis } from '../../../domain/services/calculadora-resumen-analisis.service';
import { BANDAS_MULTIESPECTRALES } from '../../../domain/value-objects/archivo-dji.vo';

const CAPTURAS_POR_GUARDADO_DE_PROGRESO = 10;

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

      analisis.completar(CalculadoraResumenAnalisis.calcular(resultados, analisis.umbrales, omitidas));
      vuelo.finalizarAnalisis();
    } catch (error) {
      this.logger.error(`Análisis ${analisisId} falló: ${this.mensaje(error)}`);
      analisis.fallar(this.mensaje(error));
      vuelo.marcarError();
    }

    await this.analisisRepository.guardar(analisis);
    await this.vueloRepository.guardar(vuelo);
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
