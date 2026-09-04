import { SubLoteOrmEntity } from '../orm-entities/sublote.orm-entity';
import { SubLote } from '../../../domain/entities/sublote.entity';
import { EstadoLote } from '../../../domain/entities/lote.entity';
import { Area } from '../../../domain/value-objects/area.vo';
import { geoJsonAPoligono, geoJsonAPunto, poligonoAGeoJson, puntoAGeoJson } from './geometria.mapper';

export class SubLoteMapper {
static aDominio(orm: SubLoteOrmEntity): SubLote {
    return SubLote.reconstruir({
        id: orm.id,
        loteId: orm.loteId,
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

static aOrm(subLote: SubLote): Partial<SubLoteOrmEntity> {
    return {
        id: subLote.id,
        loteId: subLote.loteId,
        nombre: subLote.nombre,
        geom: poligonoAGeoJson(subLote.poligono),
        centroide: puntoAGeoJson(subLote.centroide),
        areaM2: subLote.area.m2.toString(),
        areaHa: subLote.area.ha.toString(),
        descripcion: subLote.descripcion,
        estado: subLote.estado,
        deletedAt: subLote.deletedAt ?? null,
    };
}
}