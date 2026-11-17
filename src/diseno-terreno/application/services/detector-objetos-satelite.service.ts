import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import sharp from 'sharp';
import type { TipoCoberturaVisual } from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import type {
  CajaGeo,
  CuadriculaClasificada,
  DetectorCuadriculaPort,
  ProveedorRecorteSatelitalPort,
} from '../../domain/ports/proveedores-geo.port';
import { DETECTOR_CUADRICULA_TOKEN, RECORTE_SATELITAL_TOKEN } from '../../domain/ports/proveedores-geo.port';
import { ProyeccionLocal, PuntoGeo } from '../../domain/value-objects/geo';
import { ObjetoTerreno, TipoObjeto } from '../../domain/value-objects/objetos-terreno';

const VERSION_CACHE = 'v2';
const LADO_BLOQUE = 4;
const LADO_CELDA_OBJETIVO_M = Number(process.env.SATELITE_IA_LADO_CELDA_M ?? 25);
const MINIMO_CELDAS = 4;
const MAXIMO_CELDAS = Number(process.env.SATELITE_IA_MAXIMO_CELDAS ?? 8);
const MARGEN = 1.05;
const LADO_IMAGEN_PX = 1024;
const CARPETA_CACHE = process.env.DRON_IA_CACHE ?? path.join(os.tmpdir(), 'agrosoft-ia-dron');

const TIPOS_DISPONIBLES: Partial<Record<TipoCoberturaVisual, TipoObjeto>> = {
  CONSTRUCCION: 'CONSTRUCCION',
  VIA: 'VIA',
  AGUA: 'AGUA',
  BOSQUE: 'BOSQUE',
};
const TIPOS_ACTIVOS = (process.env.SATELITE_IA_TIPOS ?? 'CONSTRUCCION,VIA,AGUA,BOSQUE').split(',').map((t) => t.trim().toUpperCase());
const TIPO_A_OBJETO: Partial<Record<TipoCoberturaVisual, TipoObjeto>> = Object.fromEntries(
  Object.entries(TIPOS_DISPONIBLES).filter(([tipo]) => TIPOS_ACTIVOS.includes(tipo)),
);

@Injectable()
export class DetectorObjetosSateliteService {
  private readonly logger = new Logger(DetectorObjetosSateliteService.name);

  constructor(
    @Inject(RECORTE_SATELITAL_TOKEN)
    private readonly satelite: ProveedorRecorteSatelitalPort,
    @Inject(DETECTOR_CUADRICULA_TOKEN)
    private readonly detector: DetectorCuadriculaPort,
  ) {}

  async detectar(poligono: PuntoGeo[]): Promise<ObjetoTerreno[]> {
    const proyeccion = ProyeccionLocal.para(poligono);
    const locales = poligono.map((p) => proyeccion.aLocal(p));
    const xs = locales.map((p) => p.x);
    const ys = locales.map((p) => p.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const ladoM = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 40) * MARGEN;
    const n = Math.min(MAXIMO_CELDAS, Math.max(MINIMO_CELDAS, Math.round(ladoM / LADO_CELDA_OBJETIVO_M)));

    const suroeste = proyeccion.aGeo({ x: cx - ladoM / 2, y: cy - ladoM / 2 });
    const noreste = proyeccion.aGeo({ x: cx + ladoM / 2, y: cy + ladoM / 2 });
    const caja: CajaGeo = { sur: suroeste.lat, oeste: suroeste.lng, norte: noreste.lat, este: noreste.lng };
    const anchoGrados = caja.este - caja.oeste;
    const altoGrados = caja.norte - caja.sur;
    const anchoPx = LADO_IMAGEN_PX;
    const altoPx = Math.max(64, Math.round((LADO_IMAGEN_PX * altoGrados) / anchoGrados));

    const inicio = Date.now();
    const cuadricula = await this.clasificarConCache(caja, anchoPx, altoPx, n);
    this.logger.log(`IA satelital: cuadrícula ${n}×${n} (celdas de ${Math.round(ladoM / n)} m) en ${Math.round((Date.now() - inicio) / 1000)} s`);

    const objetos: ObjetoTerreno[] = [];
    const pasoLng = anchoGrados / cuadricula.columnas;
    const pasoLat = altoGrados / cuadricula.filas;
    for (let f = 0; f < cuadricula.filas; f++) {
      for (let c = 0; c < cuadricula.columnas; c++) {
        const tipo = TIPO_A_OBJETO[cuadricula.celdas[f][c]];
        if (!tipo) continue;
        const oeste = caja.oeste + c * pasoLng;
        const este = oeste + pasoLng;
        const norte = caja.norte - f * pasoLat;
        const sur = norte - pasoLat;
        objetos.push({
          tipo,
          forma: 'POLIGONO',
          puntos: [
            { lat: norte, lng: oeste },
            { lat: norte, lng: este },
            { lat: sur, lng: este },
            { lat: sur, lng: oeste },
          ],
          anchoM: 0,
          nombre: null,
          fuente: 'IA_SATELITE',
        });
      }
    }
    return objetos;
  }

  private async clasificarConCache(caja: CajaGeo, anchoPx: number, altoPx: number, n: number): Promise<CuadriculaClasificada> {
    await fs.mkdir(CARPETA_CACHE, { recursive: true });
    const clave = createHash('md5')
      .update(`${VERSION_CACHE}|sat|${caja.sur.toFixed(6)},${caja.oeste.toFixed(6)},${caja.norte.toFixed(6)},${caja.este.toFixed(6)}|${n}`)
      .digest('hex');
    const archivo = path.join(CARPETA_CACHE, `${clave}.json`);
    const guardado = await fs.readFile(archivo, 'utf8').catch(() => null);
    if (guardado) return JSON.parse(guardado) as CuadriculaClasificada;

    const imagen = await this.satelite.obtenerRecorte(caja, anchoPx, altoPx);
    const cuadricula = await this.clasificarPorBloques(imagen, anchoPx, altoPx, n);
    await fs.writeFile(archivo, JSON.stringify(cuadricula)).catch(() => undefined);
    return cuadricula;
  }

  private async clasificarPorBloques(imagen: Buffer, anchoPx: number, altoPx: number, n: number): Promise<CuadriculaClasificada> {
    const celdas: CuadriculaClasificada['celdas'] = Array.from({ length: n }, () => Array(n).fill('OTRO'));
    const anchoCelda = anchoPx / n;
    const altoCelda = altoPx / n;
    let bloquesOk = 0;
    const errores: string[] = [];

    for (let filaInicio = 0; filaInicio < n; filaInicio += LADO_BLOQUE) {
      for (let columnaInicio = 0; columnaInicio < n; columnaInicio += LADO_BLOQUE) {
        const filas = Math.min(LADO_BLOQUE, n - filaInicio);
        const columnas = Math.min(LADO_BLOQUE, n - columnaInicio);
        const recorte = await sharp(imagen)
          .extract({
            left: Math.round(columnaInicio * anchoCelda),
            top: Math.round(filaInicio * altoCelda),
            width: Math.min(anchoPx - Math.round(columnaInicio * anchoCelda), Math.round(columnas * anchoCelda)),
            height: Math.min(altoPx - Math.round(filaInicio * altoCelda), Math.round(filas * altoCelda)),
          })
          .toBuffer();
        try {
          const bloque = await this.detector.clasificar(recorte, { filas, columnas, origen: 'SATELITE' });
          for (let f = 0; f < filas; f++) {
            for (let c = 0; c < columnas; c++) celdas[filaInicio + f][columnaInicio + c] = bloque.celdas[f][c];
          }
          bloquesOk++;
        } catch (error) {
          errores.push(error instanceof Error ? error.message : String(error));
          this.logger.warn(`Bloque satelital ${filaInicio},${columnaInicio}: ${errores[errores.length - 1]}`);
        }
      }
    }
    if (bloquesOk === 0) throw new Error(`la IA no pudo clasificar la imagen satelital (${errores[0] ?? 'sin respuesta'})`);
    return { filas: n, columnas: n, celdas };
  }
}
