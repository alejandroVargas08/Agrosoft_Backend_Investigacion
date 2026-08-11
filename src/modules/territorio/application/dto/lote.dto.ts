import { EstadoLote, Lote } from '../../domain/entities/lote.entity';

export interface CrearLoteInput {
    nombre: string;
    vertices: { lat: number; lng: number }[];
    centroide: { lat: number; lng: number };
    areaM2: number;
    descripcion?: string;
}

export interface CambiarEstadoLoteInput {
    loteId: number;
    nuevoEstado: EstadoLote;
}

export interface LoteOutput {
    id: number;
    nombre: string;
    areaM2: number;
    areaHa: number;
    centroide: { lat: number; lng: number };
    cantidadVertices: number;
    descripcion?: string;
    estado: EstadoLote;
}

export function toLoteOutput(lote: Lote): LoteOutput {
return {
    id: lote.id as number,
    nombre: lote.nombre,
    areaM2: lote.area.m2,
    areaHa: lote.area.ha,
    centroide: { lat: lote.centroide.lat, lng: lote.centroide.lng },
    cantidadVertices: lote.poligono.cantidadVertices(),
    descripcion: lote.descripcion,
    estado: lote.estado,
};
}