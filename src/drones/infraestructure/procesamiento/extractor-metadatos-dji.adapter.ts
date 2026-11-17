import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import type { ExtractorMetadatosPort, MetadatosImagen } from '../../domain/ports/extractor-metadatos.port';

const BYTES_A_LEER = 512 * 1024;

@Injectable()
export class ExtractorMetadatosDjiAdapter implements ExtractorMetadatosPort {
  async extraer(rutaLocal: string): Promise<MetadatosImagen> {
    const xmp = await this.leerXmp(rutaLocal);
    const exposicionUs = this.numero(xmp, 'ExposureTime');

    return {
      latitud: this.numero(xmp, 'GpsLatitude'),
      longitud: this.numero(xmp, 'GpsLongitude') ?? this.numero(xmp, 'GpsLongtitude'),
      altitudRelativaM: this.numero(xmp, 'RelativeAltitude'),
      inclinacionCamaraGrados: this.numero(xmp, 'GimbalPitchDegree'),
      tomadaEn: this.fecha(xmp),
      calibracion: {
        blackLevel: this.numero(xmp, 'BlackLevel'),
        ganancia: this.numero(xmp, 'SensorGain'),
        exposicionSeg: exposicionUs != null && exposicionUs > 0 ? exposicionUs / 1_000_000 : null,
        ajusteGanancia: this.numero(xmp, 'SensorGainAdjustment'),
        irradiancia: this.numero(xmp, 'Irradiance'),
        vineteo: this.lista(xmp, 'VignettingData'),
        centroOpticoX: this.numero(xmp, 'CalibratedOpticalCenterX'),
        centroOpticoY: this.numero(xmp, 'CalibratedOpticalCenterY'),
      },
    };
  }

  private async leerXmp(rutaLocal: string): Promise<string> {
    const archivo = await fs.open(rutaLocal, 'r');
    try {
      const buffer = Buffer.alloc(BYTES_A_LEER);
      const { bytesRead } = await archivo.read(buffer, 0, BYTES_A_LEER, 0);
      const texto = buffer.subarray(0, bytesRead).toString('latin1');
      const inicio = texto.indexOf('<x:xmpmeta');
      const fin = texto.indexOf('</x:xmpmeta>');
      return inicio >= 0 && fin > inicio ? texto.slice(inicio, fin) : '';
    } finally {
      await archivo.close();
    }
  }

  private valor(xmp: string, clave: string): string | null {
    const atributo = new RegExp(`drone-dji:${clave}="([^"]*)"`).exec(xmp);
    if (atributo) return atributo[1].trim();
    const elemento = new RegExp(`<drone-dji:${clave}>([^<]*)</drone-dji:${clave}>`).exec(xmp);
    return elemento ? elemento[1].trim() : null;
  }

  private numero(xmp: string, clave: string): number | null {
    const texto = this.valor(xmp, clave);
    if (texto == null || texto === '') return null;
    const numero = parseFloat(texto);
    return Number.isFinite(numero) ? numero : null;
  }

  private lista(xmp: string, clave: string): number[] | null {
    const texto = this.valor(xmp, clave);
    if (!texto) return null;
    const numeros = texto.split(',').map((v) => parseFloat(v));
    return numeros.length > 0 && numeros.every(Number.isFinite) ? numeros : null;
  }

  private fecha(xmp: string): Date | null {
    const texto = /xmp:CreateDate="([^"]*)"/.exec(xmp)?.[1] ?? /<xmp:CreateDate>([^<]*)</.exec(xmp)?.[1];
    if (!texto) return null;
    const fecha = new Date(texto);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }
}
