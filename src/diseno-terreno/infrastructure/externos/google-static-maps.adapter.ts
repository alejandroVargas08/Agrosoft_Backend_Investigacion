import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ImagenSatelital, ProveedorImagenSatelitalPort } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';

const TIMEOUT_MS = 20000;

@Injectable()
export class GoogleStaticMapsAdapter implements ProveedorImagenSatelitalPort {
  private readonly url = 'https://maps.googleapis.com/maps/api/staticmap';

  disponible(): boolean {
    return !!process.env.GOOGLE_MAPS_API_KEY;
  }

  async obtenerImagen(poligono: PuntoGeo[]): Promise<ImagenSatelital> {
    const clave = process.env.GOOGLE_MAPS_API_KEY;
    if (!clave) throw new Error('Falta GOOGLE_MAPS_API_KEY en el .env');
    const cerrado = [...poligono, poligono[0]];
    const respuesta = await axios.get<ArrayBuffer>(this.url, {
      params: {
        size: '640x640',
        scale: 2,
        maptype: 'satellite',
        format: 'jpg',
        path: `color:0xff0000ff|weight:3|${cerrado.map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join('|')}`,
        key: clave,
      },
      responseType: 'arraybuffer',
      timeout: TIMEOUT_MS,
    });
    const tipo = String(respuesta.headers['content-type'] ?? '');
    if (!tipo.startsWith('image/')) {
      throw new Error(`Google Static Maps no devolvió una imagen: ${Buffer.from(respuesta.data).toString('utf8').slice(0, 200)}`);
    }
    return { base64: Buffer.from(respuesta.data).toString('base64'), fuente: 'Google Maps Static API (satélite)' };
  }
}
