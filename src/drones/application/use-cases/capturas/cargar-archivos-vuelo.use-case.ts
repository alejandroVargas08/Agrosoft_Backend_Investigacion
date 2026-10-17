import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Captura } from '../../../domain/entities/captura.entity';
import type { AlmacenamientoArchivosPort } from '../../../domain/ports/almacenamiento-archivos.port';
import { ALMACENAMIENTO_ARCHIVOS_TOKEN } from '../../../domain/ports/almacenamiento-archivos.token';
import type { CapturaRepositoryPort } from '../../../domain/ports/captura.repository.port';
import { CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/captura.repository.token';
import type { ExtractorMetadatosPort } from '../../../domain/ports/extractor-metadatos.port';
import { EXTRACTOR_METADATOS_TOKEN } from '../../../domain/ports/extractor-metadatos.token';
import type { VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';
import { ArchivoDji } from '../../../domain/value-objects/archivo-dji.vo';
import { Coordenada } from '../../../domain/value-objects/coordenada.vo';
import { ObtenerVueloUseCase } from '../vuelos/obtener-vuelo.use-case';

export interface ArchivoRecibido {
  rutaTemporal: string;
  nombreOriginal: string;
}

export interface ArchivoRechazado {
  archivo: string;
  motivo: string;
}

export interface ResultadoCarga {
  recibidos: number;
  aceptados: number;
  rechazados: ArchivoRechazado[];
  capturasActualizadas: number;
  capturasCompletas: number;
  totalCapturasVuelo: number;
}

@Injectable()
export class CargarArchivosVueloUseCase {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    @Inject(CAPTURA_REPOSITORY_TOKEN)
    private readonly capturaRepository: CapturaRepositoryPort,
    @Inject(ALMACENAMIENTO_ARCHIVOS_TOKEN)
    private readonly almacenamiento: AlmacenamientoArchivosPort,
    @Inject(EXTRACTOR_METADATOS_TOKEN)
    private readonly extractorMetadatos: ExtractorMetadatosPort,
    private readonly obtenerVueloUseCase: ObtenerVueloUseCase,
  ) {}

  async execute(vueloId: number, archivos: ArchivoRecibido[]): Promise<ResultadoCarga> {
    const vuelo = await this.obtenerVueloUseCase.execute(vueloId);
    if (!vuelo.puedeCargarImagenes()) {
      throw new ConflictException('El vuelo se está analizando; espera a que termine para cargar más imágenes');
    }

    const rechazados: ArchivoRechazado[] = [];
    const validos: { archivo: ArchivoRecibido; dji: ArchivoDji }[] = [];

    for (const archivo of archivos) {
      const dji = ArchivoDji.interpretar(archivo.nombreOriginal);
      if (dji) {
        validos.push({ archivo, dji });
      } else {
        rechazados.push({
          archivo: archivo.nombreOriginal,
          motivo: 'El nombre no corresponde a una captura del Mavic 3M (DJI_..._D.JPG o DJI_..._MS_G|R|RE|NIR.TIF)',
        });
      }
    }

    const claves = [...new Set(validos.map((v) => v.dji.claveCaptura))];
    const existentes = await this.capturaRepository.buscarPorClaves(vueloId, claves);
    const capturas = new Map(existentes.map((c) => [c.claveCaptura, c]));
    const modificadas = new Set<string>();
    let aceptados = 0;

    for (const { archivo, dji } of validos) {
      try {
        const metadatos = await this.extractorMetadatos.extraer(archivo.rutaTemporal);
        const ruta = await this.almacenamiento.guardar(archivo.rutaTemporal, `vuelos/${vueloId}/${dji.nombre}`);

        let captura = capturas.get(dji.claveCaptura);
        if (!captura) {
          captura = Captura.crear({ vueloId, claveCaptura: dji.claveCaptura, numeroCaptura: dji.numeroCaptura });
          capturas.set(dji.claveCaptura, captura);
        }

        captura.agregarArchivo(
          dji.banda,
          { ruta, nombreOriginal: dji.nombre, calibracion: metadatos.calibracion },
          {
            ubicacion: Coordenada.intentarCrear(metadatos.latitud, metadatos.longitud),
            altitudRelativaM: metadatos.altitudRelativaM,
            tomadaEn: metadatos.tomadaEn,
          },
        );
        modificadas.add(dji.claveCaptura);
        aceptados++;
      } catch (error) {
        rechazados.push({
          archivo: archivo.nombreOriginal,
          motivo: error instanceof Error ? error.message : 'No se pudo procesar el archivo',
        });
      }
    }

    const guardadas = await this.capturaRepository.guardarVarias(
      [...modificadas].map((clave) => capturas.get(clave) as Captura),
    );
    const totalCapturasVuelo = await this.capturaRepository.contarPorVuelo(vueloId);

    if (aceptados > 0) {
      vuelo.registrarImagenes(totalCapturasVuelo);
      await this.vueloRepository.guardar(vuelo);
    }

    return {
      recibidos: archivos.length,
      aceptados,
      rechazados,
      capturasActualizadas: guardadas.length,
      capturasCompletas: guardadas.filter((c) => c.completa).length,
      totalCapturasVuelo,
    };
  }
}
