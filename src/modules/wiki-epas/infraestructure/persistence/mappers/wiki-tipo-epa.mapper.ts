import { WikiTipoEpa, TipoEpaEnum } from '../../../domain/entities/wiki-tipo-epa.entity';
import { WikiTipoEpaOrmEntity } from '../entities/wiki-tipo-epa.orm-entity';

export class WikiTipoEpaMapper {
  static toDomain(orm: WikiTipoEpaOrmEntity): WikiTipoEpa {
    return WikiTipoEpa.desdePersistencia({
      id: orm.id,
      nombre: orm.nombre,
      descripcion: orm.descripcion,
      tipoEpaEnum: orm.tipoEpaEnum as TipoEpaEnum,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(tipoEpa: WikiTipoEpa): WikiTipoEpaOrmEntity {
    const orm = new WikiTipoEpaOrmEntity();
    if (tipoEpa.id) orm.id = tipoEpa.id;
    orm.nombre = tipoEpa.nombre;
    orm.descripcion = tipoEpa.descripcion;
    orm.tipoEpaEnum = tipoEpa.tipoEpaEnum;
    return orm;
  }
}