import { TipoCultivoWiki } from '../../../domain/entities/tipo-cultivo-wiki.entity';
import { TipoCultivoWikiOrmEntity } from '../entities/tipo-cultivo-wiki.orm-entity';

export class TipoCultivoWikiMapper {
  static toDomain(orm: TipoCultivoWikiOrmEntity): TipoCultivoWiki {
    return TipoCultivoWiki.desdePersistencia({
      id: orm.id,
      nombre: orm.nombre,
      descripcion: orm.descripcion,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(tipoCultivo: TipoCultivoWiki): TipoCultivoWikiOrmEntity {
    const orm = new TipoCultivoWikiOrmEntity();
    if (tipoCultivo.id) orm.id = tipoCultivo.id;
    orm.nombre = tipoCultivo.nombre;
    orm.descripcion = tipoCultivo.descripcion;
    return orm;
  }
}