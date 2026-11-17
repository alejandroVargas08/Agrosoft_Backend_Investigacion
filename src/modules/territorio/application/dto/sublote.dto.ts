import { EstadoLote } from '../../domain/entities/lote.entity';
import { SubLote } from '../../domain/entities/sublote.entity';

export interface CrearSubLoteInput {
    loteId: number;
    nombre: string;
    vertices: { lat: number; lng: number }[];
    centroide: { lat: number; lng: number };
    areaM2: number;
    descripcion?: string;
}

export interface CambiarEstadoSubLoteInput {
    subLoteId: number;
    nuevoEstado: EstadoLote;
}

export interface SubLoteOutput {
    id: number;
    loteId: number;
    nombre: string;
    areaM2: number;
    areaHa: number;
    centroide: { lat: number; lng: number };
    vertices: { lat: number; lng: number }[];
    descripcion?: string;
    estado: EstadoLote;
}

export function toSubLoteOutput(subLote: SubLote): SubLoteOutput {
    return {
        id: subLote.id as number,
        loteId: subLote.loteId,
        nombre: subLote.nombre,
        areaM2: subLote.area.m2,
        areaHa: subLote.area.ha,
        centroide: { lat: subLote.centroide.lat, lng: subLote.centroide.lng },
        vertices: subLote.poligono.vertices.map((v) => ({ lat: v.lat, lng: v.lng })),
        descripcion: subLote.descripcion,
        estado: subLote.estado,
    };
}