import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { AlmacenamientoArchivosPort } from '../../../drones/domain/ports/almacenamiento-archivos.port';
import { ALMACENAMIENTO_ARCHIVOS_TOKEN } from '../../../drones/domain/ports/almacenamiento-archivos.token';
import type { CapturaRepositoryPort } from '../../../drones/domain/ports/captura.repository.port';
import { CAPTURA_REPOSITORY_TOKEN } from '../../../drones/domain/ports/captura.repository.token';
import type { VueloRepositoryPort } from '../../../drones/domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../drones/domain/ports/vuelo.repository.token';
import type { TipoCoberturaVisual } from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import type { CuadriculaClasificada, DetectorCuadriculaPort } from '../../domain/ports/proveedores-geo.port';
import { DETECTOR_CUADRICULA_TOKEN } from '../../domain/ports/proveedores-geo.port';
import { ProyeccionLocal, PuntoGeo } from '../../domain/value-objects/geo';
import { ObjetoTerreno, TipoObjeto } from '../../domain/value-objects/objetos-terreno';

const ALTURA_POR_DEFECTO_M = 60;
const INCLINACION_MINIMA_VERTICAL = 80;
const MAXIMO_FOTOS = Number(process.env.DRON_IA_MAXIMO_FOTOS ?? 12);
const FOTOS_EN_PARALELO = Math.max(1, Number(process.env.DRON_IA_PARALELO ?? 2));
const TIEMPO_MAXIMO_MS = Number(process.env.DRON_IA_TIEMPO_MAX_S ?? 90) * 1000;
const CARPETA_CACHE = process.env.DRON_IA_CACHE ?? path.join(os.tmpdir(), 'agrosoft-ia-dron');
const FOV_DIAGONAL_GRADOS = Number(process.env.DRON_FOV_DIAGONAL ?? 84);
const PROPORCION_ANCHO = 4;
const PROPORCION_ALTO = 3;
const BYTES_XMP = 256 * 1024;

const TIPO_A_OBJETO: Partial<Record<TipoCoberturaVisual, TipoObjeto>> = {
  CONSTRUCCION: 'CONSTRUCCION',
  VIA: 'VIA',
  AGUA: 'AGUA',
  BOSQUE: 'BOSQUE',
};

interface FotoVertical {
  centro: PuntoGeo;
  alturaM: number;
  ruta: string;
}

@Injectable()
export class DetectorObjetosDronService {
  private readonly logger = new Logger(DetectorObjetosDronService.name);

  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    @Inject(CAPTURA_REPOSITORY_TOKEN)
    private readonly capturaRepository: CapturaRepositoryPort,
    @Inject(ALMACENAMIENTO_ARCHIVOS_TOKEN)
    private readonly almacenamiento: AlmacenamientoArchivosPort,
    @Inject(DETECTOR_CUADRICULA_TOKEN)
    private readonly detector: DetectorCuadriculaPort,
  ) {}

  async detectar(vueloId: number): Promise<ObjetoTerreno[]> {
    const vuelo = await this.vueloRepository.buscarPorId(vueloId);
    if (!vuelo) throw new Error(`el vuelo #${vueloId} no existe`);

    const fotos = (await this.capturaRepository.listarPorVuelo(vueloId))
      .filter((c) => c.ubicacion && c.archivos.RGB?.ruta)
      .filter((c) => c.inclinacionCamaraGrados == null || Math.abs(c.inclinacionCamaraGrados) >= INCLINACION_MINIMA_VERTICAL)
      .map<FotoVertical>((c) => ({
        centro: { lat: c.ubicacion!.latitud, lng: c.ubicacion!.longitud },
        alturaM: c.altitudRelativaM ?? vuelo.alturaVueloM ?? ALTURA_POR_DEFECTO_M,
        ruta: c.archivos.RGB!.ruta,
      }));
    if (fotos.length === 0) throw new Error('el vuelo no tiene fotos RGB verticales con GPS');

    await fs.mkdir(CARPETA_CACHE, { recursive: true });
    const elegidas = this.repartir(fotos, MAXIMO_FOTOS);
    const limite = Date.now() + TIEMPO_MAXIMO_MS;
    const objetos: ObjetoTerreno[] = [];
    let analizadas = 0;
    let siguiente = 0;

    const trabajador = async () => {
      while (siguiente < elegidas.length && Date.now() < limite) {
        const foto = elegidas[siguiente++];
        try {
          objetos.push(...(await this.analizarFoto(foto)));
          analizadas++;
        } catch (error) {
          this.logger.warn(`Foto ${foto.ruta}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };
    const inicio = Date.now();
    await Promise.all(Array.from({ length: Math.min(FOTOS_EN_PARALELO, elegidas.length) }, trabajador));
    this.logger.log(`IA del dron: ${analizadas}/${elegidas.length} fotos en ${Math.round((Date.now() - inicio) / 1000)} s`);

    if (analizadas === 0) throw new Error('la IA no alcanzó a analizar ninguna foto del vuelo');
    return objetos;
  }

  private async clasificarConCache(rutaLocal: string): Promise<CuadriculaClasificada> {
    const info = await fs.stat(rutaLocal);
    const clave = createHash('md5').update(`${rutaLocal}|${info.size}|${info.mtimeMs}`).digest('hex');
    const archivo = path.join(CARPETA_CACHE, `${clave}.json`);
    const guardado = await fs.readFile(archivo, 'utf8').catch(() => null);
    if (guardado) return JSON.parse(guardado) as CuadriculaClasificada;
    const cuadricula = await this.detector.clasificar(rutaLocal);
    await fs.writeFile(archivo, JSON.stringify(cuadricula)).catch(() => undefined);
    return cuadricula;
  }

  private async analizarFoto(foto: FotoVertical): Promise<ObjetoTerreno[]> {
    const rutaLocal = await this.almacenamiento.obtenerRutaLocal(foto.ruta);
    const [cuadricula, rumbo] = await Promise.all([this.clasificarConCache(rutaLocal), this.leerRumbo(rutaLocal)]);

    const diagonal = 2 * foto.alturaM * Math.tan((FOV_DIAGONAL_GRADOS * Math.PI) / 360);
    const hipotenusa = Math.hypot(PROPORCION_ANCHO, PROPORCION_ALTO);
    const anchoM = (diagonal * PROPORCION_ANCHO) / hipotenusa;
    const altoM = (diagonal * PROPORCION_ALTO) / hipotenusa;
    const anchoCelda = anchoM / cuadricula.columnas;
    const altoCelda = altoM / cuadricula.filas;

    const proyeccion = new ProyeccionLocal(foto.centro);
    const theta = (rumbo * Math.PI) / 180;
    const aGeo = (dx: number, dy: number): PuntoGeo =>
      proyeccion.aGeo({
        x: dx * Math.cos(theta) + dy * Math.sin(theta),
        y: -dx * Math.sin(theta) + dy * Math.cos(theta),
      });

    const objetos: ObjetoTerreno[] = [];
    for (let f = 0; f < cuadricula.filas; f++) {
      for (let c = 0; c < cuadricula.columnas; c++) {
        const tipo = TIPO_A_OBJETO[cuadricula.celdas[f][c]];
        if (!tipo) continue;
        const izquierda = -anchoM / 2 + c * anchoCelda;
        const derecha = izquierda + anchoCelda;
        const arriba = altoM / 2 - f * altoCelda;
        const abajo = arriba - altoCelda;
        objetos.push({
          tipo,
          forma: 'POLIGONO',
          puntos: [aGeo(izquierda, arriba), aGeo(derecha, arriba), aGeo(derecha, abajo), aGeo(izquierda, abajo)],
          anchoM: 0,
          nombre: null,
          fuente: 'IA_DRON',
        });
      }
    }
    return objetos;
  }

  private async leerRumbo(ruta: string): Promise<number> {
    let archivo: Awaited<ReturnType<typeof fs.open>> | null = null;
    try {
      archivo = await fs.open(ruta, 'r');
      const buffer = Buffer.alloc(BYTES_XMP);
      const { bytesRead } = await archivo.read(buffer, 0, BYTES_XMP, 0);
      const xmp = buffer.subarray(0, bytesRead).toString('latin1');
      for (const clave of ['GimbalYawDegree', 'FlightYawDegree']) {
        const valor = this.leerXmp(xmp, clave);
        if (valor !== null) return valor;
      }
      return 0;
    } catch {
      return 0;
    } finally {
      await archivo?.close();
    }
  }

  private leerXmp(xmp: string, clave: string): number | null {
    const atributo = new RegExp(`drone-dji:${clave}="([^"]*)"`).exec(xmp);
    const elemento = new RegExp(`<drone-dji:${clave}>([^<]*)</drone-dji:${clave}>`).exec(xmp);
    const valor = Number((atributo ?? elemento)?.[1]);
    return Number.isFinite(valor) ? valor : null;
  }

  private repartir<T>(lista: T[], maximo: number): T[] {
    if (lista.length <= maximo) return lista;
    const paso = lista.length / maximo;
    return Array.from({ length: maximo }, (_, i) => lista[Math.floor(i * paso)]);
  }
}
