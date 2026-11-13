import type { TipoCoberturaVisual } from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import { PuntoGeo } from './geo';

export type ClaseTextura = 'ARENOSO' | 'FRANCO_ARENOSO' | 'FRANCO' | 'FRANCO_ARCILLOSO' | 'ARCILLOSO';

export const CLASES_TEXTURA: ClaseTextura[] = ['ARENOSO', 'FRANCO_ARENOSO', 'FRANCO', 'FRANCO_ARCILLOSO', 'ARCILLOSO'];

export interface Topografia {
  altitudPromedioM: number;
  altitudMinM: number;
  altitudMaxM: number;
  pendientePct: number;
  azimutBajadaGrados: number | null;
  puntosMuestreados: number;
  fuente: string;
}

export interface Clima {
  temperaturaMediaC: number;
  temperaturaMinMediaC: number;
  temperaturaMaxMediaC: number;
  precipitacionAnualMm: number;
  anios: number;
  fuente: string;
}

export interface Suelo {
  ph: number | null;
  arcillaPct: number | null;
  arenaPct: number | null;
  limoPct: number | null;
  carbonoOrganicoGKg: number | null;
  textura: ClaseTextura | null;
  fuente: string;
}

export interface ZonaExcluida {
  centro: PuntoGeo;
  radioM: number;
  motivo: string;
}

export type FuenteCobertura = 'DRON' | 'SATELITE';

export interface CoberturaTerreno {
  fuente: FuenteCobertura;
  porcentajes: Partial<Record<TipoCoberturaVisual, number>>;
  porcentajeSembrable: number;
  observaciones: string[];
  zonasExcluidas: ZonaExcluida[];
  fecha: Date | null;
  referencia: string | null;
}

export interface PerfilTerreno {
  ubicacion: PuntoGeo;
  areaM2: number;
  topografia: Topografia | null;
  clima: Clima | null;
  suelo: Suelo | null;
  cobertura: CoberturaTerreno | null;
  fuentesFallidas: string[];
}

const SEMBRABLES: TipoCoberturaVisual[] = ['CULTIVO', 'PASTO', 'SUELO_DESNUDO'];

export function porcentajeSembrable(porcentajes: Partial<Record<TipoCoberturaVisual, number>>): number {
  const total = SEMBRABLES.reduce((suma, tipo) => suma + (porcentajes[tipo] ?? 0), 0);
  return Math.round(Math.min(100, total));
}

export function clasificarTextura(arenaPct: number | null, arcillaPct: number | null): ClaseTextura | null {
  if (arenaPct == null || arcillaPct == null) return null;
  if (arcillaPct >= 40) return 'ARCILLOSO';
  if (arcillaPct >= 27) return 'FRANCO_ARCILLOSO';
  if (arenaPct >= 70) return 'ARENOSO';
  if (arenaPct >= 50) return 'FRANCO_ARENOSO';
  return 'FRANCO';
}
