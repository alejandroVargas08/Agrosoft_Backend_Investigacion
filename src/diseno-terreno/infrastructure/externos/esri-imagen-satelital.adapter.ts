import { Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import { CajaGeo, ImagenSatelital, ProveedorImagenSatelitalPort, ProveedorRecorteSatelitalPort } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';

const TIMEOUT_MS = 30000;
const LADO_PX = 1024;
const MARGEN = 1.3;
const LADO_MOSAICO = 256;
const ZOOM_MAXIMO = 19;
const MAXIMO_MOSAICOS = 36;
const ZOOM_MINIMO = 14;
const BYTES_MOSAICO_VACIO = 4000;

// Proyección Web Mercator: grados -> píxel global en el zoom dado
function pixelX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * LADO_MOSAICO * 2 ** zoom;
}

function pixelY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * LADO_MOSAICO * 2 ** zoom;
}

@Injectable()
export class EsriImagenSatelitalAdapter implements ProveedorImagenSatelitalPort, ProveedorRecorteSatelitalPort {
  readonly fuente = 'Esri World Imagery (Esri, Maxar, Earthstar Geographics)';
  private readonly urlMosaicos = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile';

  disponible(): boolean {
    return true;
  }

  // Esri apagó la descarga por recorte (MapServer/export responde 500), pero
  // sigue sirviendo los mosaicos de 256 px. El recorte se arma con ellos.
  async obtenerRecorte(caja: CajaGeo, anchoPx: number, altoPx: number): Promise<Buffer> {
    let zoom = ZOOM_MAXIMO;
    // El zoom más alto que no pase de MAXIMO_MOSAICOS
    while (zoom > 1 && this.mosaicosNecesarios(caja, zoom) > MAXIMO_MOSAICOS) zoom--;
    // Donde Esri no tiene foto a ese zoom devuelve un mosaico gris de "Map data not
    // yet available" (unos 2,5 KB). Se baja el zoom hasta encontrar foto real.
    const centroLng = (caja.oeste + caja.este) / 2;
    const centroLat = (caja.sur + caja.norte) / 2;
    while (zoom > ZOOM_MINIMO) {
      const crudo = await this.mosaicoCrudo(
        zoom,
        Math.floor(pixelX(centroLng, zoom) / LADO_MOSAICO),
        Math.floor(pixelY(centroLat, zoom) / LADO_MOSAICO),
      ).catch(() => null);
      if (crudo && crudo.length >= BYTES_MOSAICO_VACIO) break;
      zoom--;
    }

    const x0 = pixelX(caja.oeste, zoom);
    const x1 = pixelX(caja.este, zoom);
    const y0 = pixelY(caja.norte, zoom);
    const y1 = pixelY(caja.sur, zoom);
    const tx0 = Math.floor(x0 / LADO_MOSAICO);
    const tx1 = Math.floor((x1 - 1e-9) / LADO_MOSAICO);
    const ty0 = Math.floor(y0 / LADO_MOSAICO);
    const ty1 = Math.floor((y1 - 1e-9) / LADO_MOSAICO);

    const pedidos: Promise<sharp.OverlayOptions>[] = [];
    for (let tx = tx0; tx <= tx1; tx++) {
      for (let ty = ty0; ty <= ty1; ty++) {
        pedidos.push(
          this.mosaico(zoom, tx, ty).then((input) => ({
            input,
            left: (tx - tx0) * LADO_MOSAICO,
            top: (ty - ty0) * LADO_MOSAICO,
          })),
        );
      }
    }
    const piezas = await Promise.all(pedidos);

    const lienzo = await sharp({
      create: {
        width: (tx1 - tx0 + 1) * LADO_MOSAICO,
        height: (ty1 - ty0 + 1) * LADO_MOSAICO,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .composite(piezas)
      .png()
      .toBuffer();

    const left = Math.max(0, Math.round(x0 - tx0 * LADO_MOSAICO));
    const top = Math.max(0, Math.round(y0 - ty0 * LADO_MOSAICO));
    const width = Math.max(1, Math.round(x1 - x0));
    const height = Math.max(1, Math.round(y1 - y0));
    return sharp(lienzo)
      .extract({ left, top, width, height })
      .resize(anchoPx, altoPx, { fit: 'fill' })
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  private mosaicosNecesarios(caja: CajaGeo, zoom: number): number {
    const ancho = Math.floor(pixelX(caja.este, zoom) / LADO_MOSAICO) - Math.floor(pixelX(caja.oeste, zoom) / LADO_MOSAICO) + 1;
    const alto = Math.floor(pixelY(caja.sur, zoom) / LADO_MOSAICO) - Math.floor(pixelY(caja.norte, zoom) / LADO_MOSAICO) + 1;
    return ancho * alto;
  }

  private async mosaicoCrudo(zoom: number, x: number, y: number): Promise<Buffer> {
    const respuesta = await axios.get<ArrayBuffer>(`${this.urlMosaicos}/${zoom}/${y}/${x}`, {
      responseType: 'arraybuffer',
      timeout: TIMEOUT_MS,
    });
    return Buffer.from(respuesta.data);
  }

  private async mosaico(zoom: number, x: number, y: number): Promise<Buffer> {
    const respuesta = await axios.get<ArrayBuffer>(`${this.urlMosaicos}/${zoom}/${y}/${x}`, {
      responseType: 'arraybuffer',
      timeout: TIMEOUT_MS,
    });
    const tipo = String(respuesta.headers['content-type'] ?? '');
    if (!tipo.startsWith('image/')) {
      throw new Error(`Esri World Imagery no devolvió una imagen para el mosaico ${zoom}/${y}/${x}`);
    }
    // Se normaliza a 256x256 por si algún mosaico llega con otro tamaño
    return sharp(Buffer.from(respuesta.data)).resize(LADO_MOSAICO, LADO_MOSAICO, { fit: 'fill' }).toBuffer();
  }

  async obtenerImagen(poligono: PuntoGeo[]): Promise<ImagenSatelital> {
    const lats = poligono.map((p) => p.lat);
    const lngs = poligono.map((p) => p.lng);
    const centroLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centroLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const mitad = (Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs)) / 2) * MARGEN || 0.0005;
    const caja: CajaGeo = { oeste: centroLng - mitad, sur: centroLat - mitad, este: centroLng + mitad, norte: centroLat + mitad };

    const base = await this.obtenerRecorte(caja, LADO_PX, LADO_PX);
    const puntos = poligono
      .map((p) => {
        const x = ((p.lng - caja.oeste) / (caja.este - caja.oeste)) * LADO_PX;
        const y = ((caja.norte - p.lat) / (caja.norte - caja.sur)) * LADO_PX;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    const contorno = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${LADO_PX}" height="${LADO_PX}"><polygon points="${puntos}" fill="none" stroke="#ff0000" stroke-width="4"/></svg>`,
    );

    const imagen = await sharp(base).composite([{ input: contorno }]).jpeg({ quality: 85 }).toBuffer();
    return { base64: imagen.toString('base64'), fuente: this.fuente };
  }
}
