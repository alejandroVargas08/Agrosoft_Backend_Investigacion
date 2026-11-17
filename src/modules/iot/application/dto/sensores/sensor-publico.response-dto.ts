import { Sensor, EstadoConexion } from '../../../domain/entities/sensor.entity';
import { TipoSensor } from '../../../domain/entities/tipo-sensor.entity';
import { Protocolo } from '../../../domain/value-objects/configuracion-conexion.vo';

/**
 * Forma plana con la que el sensor sale de la API.
 *
 * La entidad de dominio guarda todo en un campo privado `props` y no es
 * serializable: al devolverla tal cual, Nest emitia {"props":{...}} y el
 * frontend no encontraba ningun campo. Este DTO es el contrato publico.
 *
 * `tipo`, `unidad` y `decimales` vienen de tipos_sensores: el sensor solo
 * guarda tipoSensorId, pero la UI necesita el nombre y la unidad para poder
 * mostrar la lectura.
 */
export interface SensorPublico {
  id: number | null;
  nombreSensor: string;
  tipoSensorId: number;
  tipo: string | null;
  unidad: string | null;
  decimales: number | null;
  protocolo: Protocolo;
  endpointUrl: string | null;
  mqttTopic: string | null;
  valorMinimoSensor: number;
  valorMaximoSensor: number;
  activo: boolean;
  estadoConexion: EstadoConexion;
  estado: string | null;
  ultimoValor: string | null;
  ultimaMedicion: Date | null;
  ultimaVistaEn: Date | null;
  loteId: number | null;
  subLoteId: number | null;
  cultivoId: number | null;
  globalConfigId: number | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export function aSensorPublico(sensor: Sensor, tipo: TipoSensor | null): SensorPublico {
  return {
    id: sensor.id,
    nombreSensor: sensor.nombreSensor,
    tipoSensorId: sensor.tipoSensorId,
    tipo: tipo?.nombre ?? null,
    unidad: tipo?.unidad ?? null,
    decimales: tipo?.decimales ?? null,
    protocolo: sensor.conexion.protocolo,
    endpointUrl: sensor.conexion.endpointUrl,
    mqttTopic: sensor.conexion.mqttTopic,
    valorMinimoSensor: sensor.rango.minimo,
    valorMaximoSensor: sensor.rango.maximo,
    activo: sensor.activo,
    estadoConexion: sensor.estadoConexion,
    estado: sensor.estado,
    ultimoValor: sensor.ultimoValor,
    ultimaMedicion: sensor.ultimaMedicion,
    ultimaVistaEn: sensor.ultimaVistaEn,
    loteId: sensor.loteId,
    subLoteId: sensor.subLoteId,
    cultivoId: sensor.cultivoId,
    globalConfigId: sensor.globalConfigId,
    creadoEn: sensor.creadoEn,
    actualizadoEn: sensor.actualizadoEn,
  };
}
