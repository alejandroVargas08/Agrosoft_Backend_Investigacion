import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ProveedorSueloPort } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';
import { clasificarTextura, Suelo } from '../../domain/value-objects/perfil-terreno.vo';

const TIMEOUT_MS = 60000;
const PROFUNDIDADES: Record<string, number> = { '0-5cm': 5, '5-15cm': 10, '15-30cm': 15 };

interface CapaSoilGrids {
  name: string;
  unit_measure?: { d_factor?: number };
  depths: { label: string; values: { mean: number | null } }[];
}

@Injectable()
export class SoilGridsSueloAdapter implements ProveedorSueloPort {
  private readonly url = 'https://rest.isric.org/soilgrids/v2.0/properties/query';

  async obtenerSuelo(punto: PuntoGeo): Promise<Suelo> {
    const params = new URLSearchParams({ lon: punto.lng.toFixed(5), lat: punto.lat.toFixed(5), value: 'mean' });
    ['phh2o', 'clay', 'sand', 'silt', 'soc'].forEach((p) => params.append('property', p));
    Object.keys(PROFUNDIDADES).forEach((d) => params.append('depth', d));

    const url = `${this.url}?${params.toString()}`;
    const { data } = await axios
      .get(url, { timeout: TIMEOUT_MS })
      .catch(() => axios.get(url, { timeout: TIMEOUT_MS }));
    const capas: CapaSoilGrids[] = data?.properties?.layers ?? [];
    const valor = (nombre: string) => this.promedioPonderado(capas.find((c) => c.name === nombre));

    const arcillaPct = valor('clay');
    const arenaPct = valor('sand');
    const ph = valor('phh2o');
    if (ph === null && arcillaPct === null) {
      throw new Error('SoilGrids no tiene datos para este punto (posible zona urbana o cuerpo de agua)');
    }
    return {
      ph,
      arcillaPct,
      arenaPct,
      limoPct: valor('silt'),
      carbonoOrganicoGKg: valor('soc'),
      textura: clasificarTextura(arenaPct, arcillaPct),
      fuente: 'ISRIC SoilGrids 2.0 (0–30 cm, resolución 250 m)',
    };
  }

  private promedioPonderado(capa: CapaSoilGrids | undefined): number | null {
    if (!capa) return null;
    const factor = capa.unit_measure?.d_factor || 1;
    let suma = 0;
    let pesos = 0;
    for (const profundidad of capa.depths) {
      const peso = PROFUNDIDADES[profundidad.label];
      const media = profundidad.values?.mean;
      if (!peso || media == null) continue;
      suma += (media / factor) * peso;
      pesos += peso;
    }
    return pesos ? Math.round((suma / pesos) * 10) / 10 : null;
  }
}
