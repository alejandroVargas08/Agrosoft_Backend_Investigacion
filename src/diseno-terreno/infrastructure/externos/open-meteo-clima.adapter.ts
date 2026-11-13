import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ProveedorClimaPort } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';
import { Clima } from '../../domain/value-objects/perfil-terreno.vo';

const TIMEOUT_MS = 30000;
const ANIOS_HISTORICOS = 3;

interface RespuestaArchivo {
  daily?: {
    time: string[];
    temperature_2m_mean: (number | null)[];
    temperature_2m_min: (number | null)[];
    temperature_2m_max: (number | null)[];
    precipitation_sum: (number | null)[];
  };
}

@Injectable()
export class OpenMeteoClimaAdapter implements ProveedorClimaPort {
  private readonly url = 'https://archive-api.open-meteo.com/v1/archive';

  async obtenerClima(punto: PuntoGeo, altitudM: number | null): Promise<Clima> {
    const anioFinal = new Date().getFullYear() - 1;
    const anioInicial = anioFinal - ANIOS_HISTORICOS + 1;
    const { data } = await axios.get<RespuestaArchivo>(this.url, {
      params: {
        latitude: punto.lat.toFixed(5),
        longitude: punto.lng.toFixed(5),
        start_date: `${anioInicial}-01-01`,
        end_date: `${anioFinal}-12-31`,
        daily: 'temperature_2m_mean,temperature_2m_min,temperature_2m_max,precipitation_sum',
        timezone: 'auto',
        ...(altitudM !== null ? { elevation: Math.round(altitudM) } : {}),
      },
      timeout: TIMEOUT_MS,
    });

    const diario = data.daily;
    if (!diario?.time?.length) throw new Error('Open-Meteo no devolvió datos climáticos');

    const precipitacionTotal = this.suma(diario.precipitation_sum);
    return {
      temperaturaMediaC: this.promedio(diario.temperature_2m_mean),
      temperaturaMinMediaC: this.promedio(diario.temperature_2m_min),
      temperaturaMaxMediaC: this.promedio(diario.temperature_2m_max),
      precipitacionAnualMm: Math.round(precipitacionTotal / ANIOS_HISTORICOS),
      anios: ANIOS_HISTORICOS,
      fuente: `Open-Meteo Historical (${anioInicial}–${anioFinal})`,
    };
  }

  private validos(valores: (number | null)[]): number[] {
    return valores.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  }

  private suma(valores: (number | null)[]): number {
    return this.validos(valores).reduce((a, b) => a + b, 0);
  }

  private promedio(valores: (number | null)[]): number {
    const validos = this.validos(valores);
    if (validos.length === 0) throw new Error('Serie climática vacía');
    return Math.round((this.suma(validos) / validos.length) * 10) / 10;
  }
}
