import { EstadoVuelo, Vuelo } from '../../../domain/entities/vuelo.entity';
import { VueloOrmEntity } from '../entities/vuelo.orm-entity';

export class VueloMapper {
  static toDomain(orm: VueloOrmEntity): Vuelo {
    return Vuelo.desdePersistencia({
      id: orm.id,
      dronId: orm.dronId,
      nombre: orm.nombre,
      fechaVuelo: orm.fechaVuelo,
      alturaVueloM: orm.alturaVueloM,
      loteId: orm.loteId,
      subLoteId: orm.subLoteId,
      cultivoId: orm.cultivoId,
      observaciones: orm.observaciones,
      estado: orm.estado as EstadoVuelo,
      totalCapturas: orm.totalCapturas,
      creadoPorUsuarioId: orm.creadoPorUsuarioId,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(vuelo: Vuelo): VueloOrmEntity {
    const orm = new VueloOrmEntity();
    if (vuelo.id) orm.id = vuelo.id;
    orm.dronId = vuelo.dronId;
    orm.nombre = vuelo.nombre;
    orm.fechaVuelo = vuelo.fechaVuelo;
    orm.alturaVueloM = vuelo.alturaVueloM;
    orm.loteId = vuelo.loteId;
    orm.subLoteId = vuelo.subLoteId;
    orm.cultivoId = vuelo.cultivoId;
    orm.observaciones = vuelo.observaciones;
    orm.estado = vuelo.estado;
    orm.totalCapturas = vuelo.totalCapturas;
    orm.creadoPorUsuarioId = vuelo.creadoPorUsuarioId;
    return orm;
  }
}
