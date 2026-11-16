import { Area } from '../../domain/value-objects/area.vo';
import { PoligonoGeografico } from '../../domain/value-objects/poligono-geografico.vo';
import { PuntoGeografico } from '../../domain/value-objects/punto-geografico.vo';

export interface ActualizarTerrenoInput {
    nombre?: string;
    descripcion?: string;
    vertices?: { lat: number; lng: number }[];
    centroide?: { lat: number; lng: number };
    areaM2?: number;
}

export function geometriaDesde(input: ActualizarTerrenoInput): { poligono?: PoligonoGeografico; centroide?: PuntoGeografico; area?: Area } {
    if (!input.vertices) return {};
    if (!input.centroide || input.areaM2 === undefined) {
        throw new Error('Para cambiar el polígono envía también el centroide y el área');
    }
    return {
        poligono: PoligonoGeografico.crear(input.vertices.map((v) => PuntoGeografico.crear(v.lat, v.lng))),
        centroide: PuntoGeografico.crear(input.centroide.lat, input.centroide.lng),
        area: Area.desdeM2(input.areaM2),
    };
}
