import { TipoSensor } from '../../../domain/entities/tipo-sensor.entity';
import { TipoSensorOrmEntity } from '../entities/tipo-sensor.orm-entity';

export class TipoSensorMapper {
  static toDomain(orm: TipoSensorOrmEntity): TipoSensor {
    return TipoSensor.desdePersistencia({
      id: orm.id,
      nombre: orm.nombre,
      unidad: orm.unidad,
      decimales: orm.decimales,
      descripcion: orm.descripcion,
      imagen: orm.imagen,
      ttlMinutos: orm.ttlMinutos,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(tipoSensor: TipoSensor): TipoSensorOrmEntity {
    const orm = new TipoSensorOrmEntity();
    if (tipoSensor.id) orm.id = tipoSensor.id;
    orm.nombre = tipoSensor.nombre;
    orm.unidad = tipoSensor.unidad;
    orm.decimales = tipoSensor.decimales;
    orm.descripcion = tipoSensor.descripcion;
    orm.imagen = tipoSensor.imagen;
    orm.ttlMinutos = tipoSensor.ttlMinutos;
    return orm;
  }
}