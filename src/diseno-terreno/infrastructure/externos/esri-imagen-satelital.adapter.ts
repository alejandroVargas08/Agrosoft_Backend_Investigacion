import { Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import { ImagenSatelital, ProveedorImagenSatelitalPort } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';

const TIMEOUT_MS = 30000;
const LADO_PX = 1024;
const MARGEN = 1.3;

@Injectable()
export class EsriImagenSatelitalAdapter implements ProveedorImagenSatelitalPort {
  private readonly url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export';

  disponible(): boolean {
    return true;
  }

  async obtenerImagen(poligono: PuntoGeo[]): Promise<ImagenSatelital> {
    const lats = poligono.map((p) => p.lat);
    const lngs = poligono.map((p) => p.lng);
    const centroLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centroLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const mitad = (Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs)) / 2) * MARGEN || 0.0005;
    const [minLng, minLat, maxLng, maxLat] = [centroLng - mitad, centroLat - mitad, centroLng + mitad, centroLat + mitad];

    const respuesta = await axios.get<ArrayBuffer>(this.url, {
      params: {
        bbox: `${minLng},${minLat},${maxLng},${maxLat}`,
        bboxSR: 4326,
        imageSR: 4326,
        size: `${LADO_PX},${LADO_PX}`,
        format: 'jpg',
        f: 'image',
      },
      responseType: 'arraybuffer',
      timeout: TIMEOUT_MS,
    });
    const tipo = String(respuesta.headers['content-type'] ?? '');
    if (!tipo.startsWith('image/')) {
      throw new Error(`Esri World Imagery no devolvió una imagen: ${Buffer.from(respuesta.data).toString('utf8').slice(0, 200)}`);
    }

    const puntos = poligono
      .map((p) => {
        const x = ((p.lng - minLng) / (maxLng - minLng)) * LADO_PX;
        const y = ((maxLat - p.lat) / (maxLat - minLat)) * LADO_PX;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    const contorno = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${LADO_PX}" height="${LADO_PX}"><polygon points="${puntos}" fill="none" stroke="#ff0000" stroke-width="4"/></svg>`,
    );

    const imagen = await sharp(Buffer.from(respuesta.data))
      .resize(LADO_PX, LADO_PX, { fit: 'fill' })
      .composite([{ input: contorno }])
      .jpeg({ quality: 85 })
      .toBuffer();

    return { base64: imagen.toString('base64'), fuente: 'Esri World Imagery (Esri, Maxar, Earthstar Geographics)' };
  }
}
