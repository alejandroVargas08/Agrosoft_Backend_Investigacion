import { LoteOrmEntity } from '../orm-entities/lote.orm-entity';
import { Lote, EstadoLote } from '../../../domain/entities/lote.entity';
import { Area } from '../../../domain/value-objects/area.vo';
import { geoJsonAPoligono, geoJsonAPunto, poligonoAGeoJson, puntoAGeoJson } from './geometria.mapper';

export class LoteMapper {
static aDominio(orm: LoteOrmEntity): Lote {
    return Lote.reconstruir({
        id: orm.id,
        nombre: orm.nombre,
        poligono: geoJsonAPoligono(orm.geom),
        centroide: geoJsonAPunto(orm.centroide),
        area: Area.desdeM2(parseFloat(orm.areaM2)),
        descripcion: orm.descripcion,
        estado: orm.estado as EstadoLote,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
        deletedAt: orm.deletedAt,
    });
}

static aOrm(lote: Lote): Partial<LoteOrmEntity> {
    return {
        id: lote.id,
        nombre: lote.nombre,
        geom: poligonoAGeoJson(lote.poligono),
        centroide: puntoAGeoJson(lote.centroide),
        areaM2: lote.area.m2.toString(),
        areaHa: lote.area.ha.toString(),
        descripcion: lote.descripcion,
        estado: lote.estado,
        deletedAt: lote.deletedAt ?? null,
    };
}
}