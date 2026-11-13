import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FuenteObjetosPort } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';
import { ObjetoTerreno } from '../../domain/value-objects/objetos-terreno';

const TIMEOUT_MS = Number(process.env.OVERPASS_TIEMPO_MAX_S ?? 25) * 1000;
const MARGEN_GRADOS = 0.0003;
const MAXIMO_OBJETOS = 3000;
const VIGENCIA_CACHE_MS = 7 * 24 * 60 * 60 * 1000;

const SERVIDORES = (
  process.env.OVERPASS_URL ??
  'https://overpass-api.de/api/interpreter,https://overpass.kumi.systems/api/interpreter,https://overpass.private.coffee/api/interpreter'
)
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const ANCHO_VIA: Record<string, number> = {
  motorway: 14, trunk: 12, primary: 10, secondary: 8, tertiary: 7,
  unclassified: 6, residential: 6, service: 4, track: 4, living_street: 5,
  path: 2, footway: 2, cycleway: 2, steps: 2, bridleway: 2,
};

const ANCHO_CAUCE: Record<string, number> = { river: 10, canal: 4, stream: 3, ditch: 2, drain: 2 };

interface ElementoOsm {
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}

@Injectable()
export class OsmObjetosAdapter implements FuenteObjetosPort {
  private readonly logger = new Logger(OsmObjetosAdapter.name);
  private readonly carpeta = process.env.OSM_CACHE ?? path.join(os.tmpdir(), 'agrosoft-osm');

  async obtenerObjetos(poligono: PuntoGeo[]): Promise<ObjetoTerreno[]> {
    const lats = poligono.map((p) => p.lat);
    const lngs = poligono.map((p) => p.lng);
    const caja = [
      Math.min(...lats) - MARGEN_GRADOS,
      Math.min(...lngs) - MARGEN_GRADOS,
      Math.max(...lats) + MARGEN_GRADOS,
      Math.max(...lngs) + MARGEN_GRADOS,
    ]
      .map((v) => v.toFixed(4))
      .join(',');

    const elementos = await this.consultar(caja);
    return elementos
      .map((e) => this.convertir(e))
      .filter((o): o is ObjetoTerreno => o !== null)
      .map((o) => ({ ...o, fuente: 'OSM' as const }))
      .slice(0, MAXIMO_OBJETOS);
  }

  private async consultar(caja: string): Promise<ElementoOsm[]> {
    await fs.mkdir(this.carpeta, { recursive: true });
    const archivo = path.join(this.carpeta, `${createHash('md5').update(caja).digest('hex')}.json`);
    const info = await fs.stat(archivo).catch(() => null);
    if (info && Date.now() - info.mtimeMs < VIGENCIA_CACHE_MS) {
      return JSON.parse(await fs.readFile(archivo, 'utf8')) as ElementoOsm[];
    }

    const consulta = `[out:json][timeout:25];
(
  way["building"](${caja});
  way["highway"](${caja});
  way["natural"="water"](${caja});
  way["landuse"~"reservoir|basin"](${caja});
  way["waterway"](${caja});
  way["natural"="wood"](${caja});
  way["landuse"="forest"](${caja});
  way["natural"="tree_row"](${caja});
  node["natural"="tree"](${caja});
);
out geom;`;

    const errores: string[] = [];
    for (const url of SERVIDORES) {
      try {
        const { data } = await axios.post(url, `data=${encodeURIComponent(consulta)}`, {
          timeout: TIMEOUT_MS,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'AgroSoft-SENA/1.0' },
        });
        if (!Array.isArray(data?.elements)) throw new Error('respuesta sin datos');
        const elementos = data.elements as ElementoOsm[];
        await fs.writeFile(archivo, JSON.stringify(elementos)).catch(() => undefined);
        return elementos;
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : String(error);
        errores.push(`${new URL(url).host}: ${mensaje}`);
        this.logger.warn(`Overpass ${url} falló: ${mensaje}`);
      }
    }

    if (info) {
      this.logger.warn('Ningún servidor de OpenStreetMap respondió; se usan los datos guardados');
      return JSON.parse(await fs.readFile(archivo, 'utf8')) as ElementoOsm[];
    }
    throw new Error(`ningún servidor respondió (${errores.join(' | ')})`);
  }

  private convertir(e: ElementoOsm): ObjetoTerreno | null {
    const tags = e.tags ?? {};
    const nombre = tags.name ?? null;

    if (e.type === 'node') {
      if (tags.natural !== 'tree' || e.lat == null || e.lon == null) return null;
      return { tipo: 'ARBOL', forma: 'PUNTO', puntos: [{ lat: e.lat, lng: e.lon }], anchoM: 8, nombre };
    }
    if (e.type !== 'way' || !e.geometry || e.geometry.length < 2) return null;

    const puntos = e.geometry.map((g) => ({ lat: g.lat, lng: g.lon }));
    const cerrado = puntos.length >= 4 && puntos[0].lat === puntos[puntos.length - 1].lat && puntos[0].lng === puntos[puntos.length - 1].lng;
    const anillo = cerrado ? puntos.slice(0, -1) : puntos;

    if (tags.building) return cerrado ? { tipo: 'CONSTRUCCION', forma: 'POLIGONO', puntos: anillo, anchoM: 0, nombre } : null;
    if (tags.highway) {
      if (['proposed', 'construction', 'abandoned'].includes(tags.highway)) return null;
      return { tipo: 'VIA', forma: 'LINEA', puntos, anchoM: ANCHO_VIA[tags.highway] ?? 5, nombre };
    }
    if (tags.natural === 'water' || /reservoir|basin/.test(tags.landuse ?? '')) {
      return cerrado ? { tipo: 'AGUA', forma: 'POLIGONO', puntos: anillo, anchoM: 0, nombre } : null;
    }
    if (tags.waterway) return { tipo: 'AGUA', forma: 'LINEA', puntos, anchoM: ANCHO_CAUCE[tags.waterway] ?? 3, nombre };
    if (tags.natural === 'wood' || tags.landuse === 'forest') {
      return cerrado ? { tipo: 'BOSQUE', forma: 'POLIGONO', puntos: anillo, anchoM: 0, nombre } : null;
    }
    if (tags.natural === 'tree_row') return { tipo: 'ARBOL', forma: 'LINEA', puntos, anchoM: 6, nombre };
    return null;
  }
}
