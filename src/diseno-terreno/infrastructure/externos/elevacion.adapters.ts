import { Injectable } from '@nestjs/common';
import axios from 'axios';
import type { ProveedorElevacionPort } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';

const TIMEOUT_MS = 20000;

function enLotes<T>(lista: T[], tamano: number): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < lista.length; i += tamano) lotes.push(lista.slice(i, i + tamano));
  return lotes;
}

@Injectable()
export class GoogleElevacionAdapter implements ProveedorElevacionPort {
  readonly nombre = 'Google Elevation API';
  private readonly url = 'https://maps.googleapis.com/maps/api/elevation/json';

  async obtenerElevaciones(puntos: PuntoGeo[]): Promise<number[]> {
    const clave = process.env.GOOGLE_MAPS_API_KEY;
    if (!clave) throw new Error('Falta GOOGLE_MAPS_API_KEY en el .env');
    const resultado: number[] = [];
    for (const grupo of enLotes(puntos, 200)) {
      const { data } = await axios.get(this.url, {
        params: { locations: grupo.map((p) => `${p.lat},${p.lng}`).join('|'), key: clave },
        timeout: TIMEOUT_MS,
      });
      if (data?.status !== 'OK') {
        throw new Error(`Google Elevation respondió ${data?.status}: ${data?.error_message ?? 'sin detalle'}`);
      }
      resultado.push(...data.results.map((r: { elevation: number }) => r.elevation));
    }
    return resultado;
  }
}

@Injectable()
export class OpenMeteoElevacionAdapter implements ProveedorElevacionPort {
  readonly nombre = 'Open-Meteo Elevation (DEM 90 m)';
  private readonly url = 'https://api.open-meteo.com/v1/elevation';

  async obtenerElevaciones(puntos: PuntoGeo[]): Promise<number[]> {
    const resultado: number[] = [];
    for (const grupo of enLotes(puntos, 100)) {
      const { data } = await axios.get(this.url, {
        params: {
          latitude: grupo.map((p) => p.lat.toFixed(6)).join(','),
          longitude: grupo.map((p) => p.lng.toFixed(6)).join(','),
        },
        timeout: TIMEOUT_MS,
      });
      if (!Array.isArray(data?.elevation)) throw new Error('Open-Meteo no devolvió elevaciones');
      resultado.push(...data.elevation);
    }
    return resultado;
  }
}

@Injectable()
export class ElevacionConRespaldoAdapter implements ProveedorElevacionPort {
  private usado: ProveedorElevacionPort;

  constructor(
    private readonly principal: ProveedorElevacionPort,
    private readonly respaldo: ProveedorElevacionPort,
  ) {
    this.usado = principal;
  }

  get nombre(): string {
    return this.usado.nombre;
  }

  async obtenerElevaciones(puntos: PuntoGeo[]): Promise<number[]> {
    try {
      this.usado = this.principal;
      return await this.principal.obtenerElevaciones(puntos);
    } catch {
      this.usado = this.respaldo;
      return this.respaldo.obtenerElevaciones(puntos);
    }
  }
}
