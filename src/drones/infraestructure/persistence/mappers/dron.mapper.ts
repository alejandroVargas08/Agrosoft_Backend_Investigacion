import { Dron, TipoCamara } from '../../../domain/entities/dron.entity';
import { DronOrmEntity } from '../entities/dron.orm-entity';

export class DronMapper {
  static toDomain(orm: DronOrmEntity): Dron {
    return Dron.desdePersistencia({
      id: orm.id,
      nombre: orm.nombre,
      modelo: orm.modelo,
      numeroSerie: orm.numeroSerie,
      tipoCamara: orm.tipoCamara as TipoCamara,
      tieneRtk: orm.tieneRtk,
      activo: orm.activo,
      creadoPorUsuarioId: orm.creadoPorUsuarioId,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(dron: Dron): DronOrmEntity {
    const orm = new DronOrmEntity();
    if (dron.id) orm.id = dron.id;
    orm.nombre = dron.nombre;
    orm.modelo = dron.modelo;
    orm.numeroSerie = dron.numeroSerie;
    orm.tipoCamara = dron.tipoCamara;
    orm.tieneRtk = dron.tieneRtk;
    orm.activo = dron.activo;
    orm.creadoPorUsuarioId = dron.creadoPorUsuarioId;
    return orm;
  }
}
