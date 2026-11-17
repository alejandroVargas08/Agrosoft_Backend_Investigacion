import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import type { AlcanceDatos } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { Captura } from '../../../domain/entities/captura.entity';
import type { AlmacenamientoArchivosPort } from '../../../domain/ports/almacenamiento-archivos.port';
import { ALMACENAMIENTO_ARCHIVOS_TOKEN } from '../../../domain/ports/almacenamiento-archivos.token';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/analisis-vuelo.repository.token';
import type { CapturaRepositoryPort } from '../../../domain/ports/captura.repository.port';
import { CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/captura.repository.token';
import type { BandasParaProcesar, ProcesadorMultiespectralPort } from '../../../domain/ports/procesador-multiespectral.port';
import { PROCESADOR_MULTIESPECTRAL_TOKEN } from '../../../domain/ports/procesador-multiespectral.token';
import { CapaCaptura, ColoreadorCapas } from '../../../domain/services/coloreador-capas.service';
import { Banda, BANDAS_MULTIESPECTRALES } from '../../../domain/value-objects/archivo-dji.vo';
import { UmbralesNdvi } from '../../../domain/value-objects/umbrales-ndvi.vo';
import { ObtenerVueloUseCase } from '../vuelos/obtener-vuelo.use-case';

export type TamanoImagen = 'miniatura' | 'completa';

export const BANDAS_VALIDAS: Banda[] = ['RGB', 'G', 'R', 'RE', 'NIR'];
export const CAPAS_VALIDAS: CapaCaptura[] = ['NDVI', 'NDRE', 'GNDVI', 'NDWI', 'CLASIFICACION'];

const LADO_POR_TAMANO: Record<TamanoImagen, number> = { miniatura: 360, completa: 1600 };
const MAXIMO_EN_CACHE = 80;

export interface ImagenGenerada {
  contenido: Buffer;
  tipo: string;
}

@Injectable()
export class ImagenesCapturaUseCase {
  private readonly cache = new Map<string, ImagenGenerada>();

  constructor(
    @Inject(CAPTURA_REPOSITORY_TOKEN)
    private readonly capturaRepository: CapturaRepositoryPort,
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN)
    private readonly analisisRepository: AnalisisVueloRepositoryPort,
    @Inject(ALMACENAMIENTO_ARCHIVOS_TOKEN)
    private readonly almacenamiento: AlmacenamientoArchivosPort,
    @Inject(PROCESADOR_MULTIESPECTRAL_TOKEN)
    private readonly procesador: ProcesadorMultiespectralPort,
    private readonly obtenerVueloUseCase: ObtenerVueloUseCase,
  ) {}

  async imagen(vueloId: number, capturaId: number, banda: Banda, tamano: TamanoImagen, alcance: AlcanceDatos): Promise<ImagenGenerada> {
    const captura = await this.capturaDelVuelo(vueloId, capturaId, alcance);
    const archivo = captura.archivos[banda] ?? (banda === 'RGB' ? captura.archivos.G : undefined);
    if (!archivo) {
      throw new NotFoundException(`La captura ${captura.numeroCaptura} no tiene la banda ${banda}`);
    }

    const clave = `imagen:${capturaId}:${banda}:${tamano}`;
    const enCache = this.cache.get(clave);
    if (enCache) return enCache;

    const lado = LADO_POR_TAMANO[tamano];
    const ruta = await this.almacenamiento.obtenerRutaLocal(archivo.ruta);
    const esRgb = banda === 'RGB' && captura.archivos.RGB !== undefined;
    let proceso = sharp(ruta).rotate().resize({ width: lado, height: lado, fit: 'inside', withoutEnlargement: true });
    if (!esRgb) proceso = proceso.normalise().toColourspace('b-w');
    const contenido = await proceso.jpeg({ quality: tamano === 'miniatura' ? 70 : 85 }).toBuffer();

    return this.guardarEnCache(clave, { contenido, tipo: 'image/jpeg' });
  }

  async capa(vueloId: number, capturaId: number, capa: CapaCaptura, alcance: AlcanceDatos): Promise<ImagenGenerada> {
    const captura = await this.capturaDelVuelo(vueloId, capturaId, alcance);
    const faltantes = captura.bandasFaltantes();
    if (faltantes.length > 0) {
      throw new BadRequestException(`La captura ${captura.numeroCaptura} no tiene las bandas ${faltantes.join(', ')}`);
    }

    const umbrales = await this.umbralesDelVuelo(vueloId);
    const clave = `capa:${capturaId}:${capa}:${JSON.stringify(umbrales.toProps())}`;
    const enCache = this.cache.get(clave);
    if (enCache) return enCache;

    const bandas = await this.prepararBandas(captura);
    const mapa = await this.procesador.generarMapa(bandas, capa === 'CLASIFICACION' ? 'NDVI' : capa);
    const pixeles = ColoreadorCapas.colorear(mapa, capa, umbrales);
    const contenido = await sharp(pixeles, { raw: { width: mapa.ancho, height: mapa.alto, channels: 4 } })
      .png({ compressionLevel: 8 })
      .toBuffer();

    return this.guardarEnCache(clave, { contenido, tipo: 'image/png' });
  }

  private async capturaDelVuelo(vueloId: number, capturaId: number, alcance: AlcanceDatos): Promise<Captura> {
    await this.obtenerVueloUseCase.execute(vueloId, alcance);
    const capturas = await this.capturaRepository.listarPorVuelo(vueloId);
    const captura = capturas.find((c) => c.id === capturaId);
    if (!captura) throw new NotFoundException(`No existe la captura ${capturaId} en el vuelo ${vueloId}`);
    return captura;
  }

  private async umbralesDelVuelo(vueloId: number): Promise<UmbralesNdvi> {
    const analisis = await this.analisisRepository.listarPorVuelo(vueloId);
    const completado = analisis.find((a) => a.estado === 'COMPLETADO');
    return completado ? completado.umbrales : UmbralesNdvi.porDefecto();
  }

  private async prepararBandas(captura: Captura): Promise<BandasParaProcesar> {
    const entradas = await Promise.all(
      BANDAS_MULTIESPECTRALES.map(async (banda) => {
        const archivo = captura.archivos[banda]!;
        const rutaLocal = await this.almacenamiento.obtenerRutaLocal(archivo.ruta);
        return [banda, { rutaLocal, calibracion: archivo.calibracion }] as const;
      }),
    );
    return Object.fromEntries(entradas) as BandasParaProcesar;
  }

  private guardarEnCache(clave: string, imagen: ImagenGenerada): ImagenGenerada {
    if (this.cache.size >= MAXIMO_EN_CACHE) {
      const primera = this.cache.keys().next().value;
      if (primera !== undefined) this.cache.delete(primera);
    }
    this.cache.set(clave, imagen);
    return imagen;
  }
}
