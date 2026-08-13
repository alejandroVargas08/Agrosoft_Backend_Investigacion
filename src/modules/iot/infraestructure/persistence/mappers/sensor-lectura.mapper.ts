import { SensorLectura } from '../../../domain/entities/sensor-lectura.entity';
import { SensorLecturaOrmEntity } from '../entities/sensor-lectura.orm-entity';

export class SensorLecturaMapper {
  static toDomain(orm: SensorLecturaOrmEntity): SensorLectura {
    return SensorLectura.desdePersistencia({
      id: orm.id,
      sensorId: orm.sensorId,
      valor: orm.valor,
      fechaLectura: orm.fechaLectura,
      unidad: orm.unidad,
      observaciones: orm.observaciones,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(lectura: SensorLectura): SensorLecturaOrmEntity {
    const orm = new SensorLecturaOrmEntity();
    if (lectura.id) orm.id = lectura.id;
    orm.sensorId = lectura.sensorId;
    orm.valor = lectura.valor;
    orm.fechaLectura = lectura.fechaLectura;
    orm.unidad = lectura.unidad;
    orm.observaciones = lectura.observaciones;
    return orm;
  }
}