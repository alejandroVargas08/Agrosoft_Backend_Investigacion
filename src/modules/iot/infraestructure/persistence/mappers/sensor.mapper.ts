import { Sensor } from '../../../domain/entities/sensor.entity';
import { RangoOperativo } from '../../../domain/value-objects/rango-operativo.vo';
import { ConfiguracionConexion } from '../../../domain/value-objects/configuracion-conexion.vo';
import { SensorOrmEntity } from '../entities/sensor.orm-entity';

export class SensorMapper {
  static toDomain(orm: SensorOrmEntity): Sensor {
    return Sensor.desdePersistencia({
      id: orm.id,
      nombreSensor: orm.nombreSensor,
      tipoSensorId: orm.tipoSensorId,
      conexion: ConfiguracionConexion.crear(orm.protocolo as 'HTTP' | 'MQTT', orm.endpointUrl, orm.mqttTopic),
      rango: RangoOperativo.crear(orm.valorMinimoSensor, orm.valorMaximoSensor),
      activo: orm.activo,
      estadoConexion: orm.estadoConexion as any,
      estado: orm.estado,
      ultimoValor: orm.ultimoValor,
      ultimaMedicion: orm.ultimaMedicion,
      ultimaVistaEn: orm.ultimaVistaEn,
      cultivoId: orm.cultivoId,
      creadoPorUsuarioId: orm.creadoPorUsuarioId,
      globalConfigId: orm.globalConfigId,
      loteId: orm.loteId,
      subLoteId: orm.subLoteId,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(sensor: Sensor): SensorOrmEntity {
    const orm = new SensorOrmEntity();
    if (sensor.id) orm.id = sensor.id;
    orm.nombreSensor = sensor.nombreSensor;
    orm.tipoSensorId = sensor.tipoSensorId;
    orm.protocolo = sensor.conexion.protocolo;
    orm.endpointUrl = sensor.conexion.endpointUrl;
    orm.mqttTopic = sensor.conexion.mqttTopic;
    orm.valorMinimoSensor = sensor.rango.minimo;
    orm.valorMaximoSensor = sensor.rango.maximo;
    orm.activo = sensor.activo;
    orm.estadoConexion = sensor.estadoConexion;
    orm.estado = sensor.estado;
    orm.ultimoValor = sensor.ultimoValor;
    orm.ultimaMedicion = sensor.ultimaMedicion;
    orm.ultimaVistaEn = sensor.ultimaVistaEn;
    orm.cultivoId = sensor.cultivoId;
    orm.creadoPorUsuarioId = sensor.creadoPorUsuarioId;
    orm.globalConfigId = sensor.globalConfigId;
    orm.loteId = sensor.loteId;
    orm.subLoteId = sensor.subLoteId;
    return orm;
  }
}