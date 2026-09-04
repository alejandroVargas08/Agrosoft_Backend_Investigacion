import { PoligonoGeografico } from '../../../domain/value-objects/poligono-geografico.vo';
import { PuntoGeografico } from '../../../domain/value-objects/punto-geografico.vo';

type GeoJsonPoint = { type: 'Point'; coordinates: [number, number] };
type GeoJsonPolygon = { type: 'Polygon'; coordinates: number[][][] };

export function geoJsonAPunto(geom: GeoJsonPoint): PuntoGeografico {
    const [lng, lat] = geom.coordinates;
    return PuntoGeografico.crear(lat, lng);
}

export function puntoAGeoJson(punto: PuntoGeografico): GeoJsonPoint {
    return { type: 'Point', coordinates: [punto.lng, punto.lat] };
}

export function geoJsonAPoligono(geom: GeoJsonPolygon): PoligonoGeografico {
    const anilloExterior = geom.coordinates[0];
        const cerrado =
    anilloExterior.length > 1 &&
    anilloExterior[0][0] === anilloExterior[anilloExterior.length - 1][0] &&
    anilloExterior[0][1] === anilloExterior[anilloExterior.length - 1][1];
        const puntos = cerrado ? anilloExterior.slice(0, -1) : anilloExterior;

    const vertices = puntos.map(([lng, lat]) => PuntoGeografico.crear(lat, lng));
        return PoligonoGeografico.crear(vertices);
}

export function poligonoAGeoJson(poligono: PoligonoGeografico): GeoJsonPolygon {
    const anillo = poligono.vertices.map((p) => [p.lng, p.lat]);
    anillo.push(anillo[0]);
        return { type: 'Polygon', coordinates: [anillo] };
}