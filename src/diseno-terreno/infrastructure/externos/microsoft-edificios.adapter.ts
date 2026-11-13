import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createInterface } from 'readline';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import { FuenteObjetosPort } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';
import { ObjetoTerreno } from '../../domain/value-objects/objetos-terreno';

const URL_ENLACES = 'https://minedbuildings.z5.web.core.windows.net/global-buildings/dataset-links.csv';
const NIVEL_QUADKEY = 9;
const MARGEN_GRADOS = 0.0003;
const TIMEOUT_DESCARGA_MS = 180000;
const VIGENCIA_ENLACES_MS = 30 * 24 * 60 * 60 * 1000;
const MARGEN_FILTRO_RAPIDO = 0.01;
const PRIMERA_COORDENADA = /\[\s*\[\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/;

interface Caja {
  sur: number;
  oeste: number;
  norte: number;
  este: number;
}

interface FeatureEdificio {
  geometry?: { type?: string; coordinates?: number[][][] };
}

@Injectable()
export class MicrosoftEdificiosAdapter implements FuenteObjetosPort {
  private readonly logger = new Logger(MicrosoftEdificiosAdapter.name);
  private readonly carpeta = process.env.MICROSOFT_EDIFICIOS_CACHE ?? path.join(os.tmpdir(), 'agrosoft-edificios');
  private enlaces: Map<string, string[]> | null = null;
  private readonly descargas = new Map<string, Promise<string>>();

  async obtenerObjetos(poligono: PuntoGeo[]): Promise<ObjetoTerreno[]> {
    const lats = poligono.map((p) => p.lat);
    const lngs = poligono.map((p) => p.lng);
    const caja: Caja = {
      sur: Math.min(...lats) - MARGEN_GRADOS,
      oeste: Math.min(...lngs) - MARGEN_GRADOS,
      norte: Math.max(...lats) + MARGEN_GRADOS,
      este: Math.max(...lngs) + MARGEN_GRADOS,
    };
    const quadkeys = new Set([
      this.quadkey(caja.sur, caja.oeste),
      this.quadkey(caja.sur, caja.este),
      this.quadkey(caja.norte, caja.oeste),
      this.quadkey(caja.norte, caja.este),
    ]);

    await fs.mkdir(this.carpeta, { recursive: true });
    const enlaces = await this.cargarEnlaces();
    const objetos: ObjetoTerreno[] = [];
    for (const qk of quadkeys) {
      for (const url of enlaces.get(qk) ?? []) {
        const archivo = await this.descargar(url);
        objetos.push(...(await this.leerEdificios(archivo, caja)));
      }
    }
    return objetos;
  }

  private quadkey(lat: number, lng: number): string {
    const n = 2 ** NIVEL_QUADKEY;
    const x = Math.floor(((lng + 180) / 360) * n);
    const rad = (lat * Math.PI) / 180;
    const y = Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
    let clave = '';
    for (let i = NIVEL_QUADKEY; i > 0; i--) {
      const mascara = 1 << (i - 1);
      let digito = 0;
      if ((x & mascara) !== 0) digito += 1;
      if ((y & mascara) !== 0) digito += 2;
      clave += digito;
    }
    return clave;
  }

  private async cargarEnlaces(): Promise<Map<string, string[]>> {
    if (this.enlaces) return this.enlaces;
    const archivo = path.join(this.carpeta, 'dataset-links.csv');
    const info = await fs.stat(archivo).catch(() => null);
    if (!info || Date.now() - info.mtimeMs > VIGENCIA_ENLACES_MS) {
      const { data } = await axios.get<string>(URL_ENLACES, { responseType: 'text', timeout: TIMEOUT_DESCARGA_MS });
      await fs.writeFile(archivo, data);
    }
    const texto = await fs.readFile(archivo, 'utf8');
    const mapa = new Map<string, string[]>();
    for (const linea of texto.split(/\r?\n/)) {
      const coincidencia = /,"?(\d+)"?,"?(https?:\/\/[^",\s]+)/.exec(linea);
      if (!coincidencia) continue;
      const clave = coincidencia[1].padStart(NIVEL_QUADKEY, '0');
      const url = coincidencia[2];
      mapa.set(clave, [...(mapa.get(clave) ?? []), url]);
    }
    this.enlaces = mapa;
    return mapa;
  }

  private descargar(url: string): Promise<string> {
    const enCurso = this.descargas.get(url);
    if (enCurso) return enCurso;
    const promesa = this.descargarArchivo(url).finally(() => this.descargas.delete(url));
    this.descargas.set(url, promesa);
    return promesa;
  }

  private async descargarArchivo(url: string): Promise<string> {
    const nombre = createHash('md5').update(url).digest('hex') + '.gz';
    const archivo = path.join(this.carpeta, nombre);
    if (await fs.stat(archivo).catch(() => null)) return archivo;
    this.logger.log(`Descargando edificios de Microsoft: ${url}`);
    const temporal = `${archivo}.parcial`;
    const respuesta = await axios.get(url, { responseType: 'stream', timeout: TIMEOUT_DESCARGA_MS });
    await pipeline(respuesta.data, createWriteStream(temporal));
    await fs.rename(temporal, archivo);
    return archivo;
  }

  private async leerEdificios(archivo: string, caja: Caja): Promise<ObjetoTerreno[]> {
    const lector = createInterface({ input: createReadStream(archivo).pipe(createGunzip()), crlfDelay: Infinity });
    const resultado: ObjetoTerreno[] = [];
    for await (const linea of lector) {
      const inicio = linea.indexOf('{');
      if (inicio < 0) continue;
      const primera = PRIMERA_COORDENADA.exec(linea);
      if (primera) {
        const lng = Number(primera[1]);
        const lat = Number(primera[2]);
        if (
          lat < caja.sur - MARGEN_FILTRO_RAPIDO ||
          lat > caja.norte + MARGEN_FILTRO_RAPIDO ||
          lng < caja.oeste - MARGEN_FILTRO_RAPIDO ||
          lng > caja.este + MARGEN_FILTRO_RAPIDO
        ) continue;
      }
      let feature: FeatureEdificio;
      try {
        feature = JSON.parse(linea.slice(inicio));
      } catch {
        continue;
      }
      const anillo = feature.geometry?.type === 'Polygon' ? feature.geometry.coordinates?.[0] : undefined;
      if (!anillo || anillo.length < 4) continue;
      const dentro = anillo.some(([lng, lat]) => lat >= caja.sur && lat <= caja.norte && lng >= caja.oeste && lng <= caja.este);
      if (!dentro) continue;
      resultado.push({
        tipo: 'CONSTRUCCION',
        forma: 'POLIGONO',
        puntos: anillo.slice(0, -1).map(([lng, lat]) => ({ lat, lng })),
        anchoM: 0,
        nombre: null,
        fuente: 'MICROSOFT',
      });
    }
    return resultado;
  }
}
