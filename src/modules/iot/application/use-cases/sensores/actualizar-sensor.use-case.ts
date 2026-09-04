import { Inject, Injectable } from '@nestjs/common';
import { Sensor } from '../../../domain/entities/sensor.entity';
import { RangoOperativo } from '../../../domain/value-objects/rango-operativo.vo';
import { ConfiguracionConexion } from '../../../domain/value-objects/configuracion-conexion.vo';
import type { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/sensor.repository.token';
import { ActualizarSensorDto } from '../../dto/sensores/actualizar-sensor.dto';
import { ObtenerSensorUseCase } from './obtener-sensor.use-case';

@Injectable()
export class ActualizarSensorUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY_TOKEN)
    private readonly sensorRepository: SensorRepositoryPort,
    private readonly obtenerSensorUseCase: ObtenerSensorUseCase,
  ) {}

  async execute(id: number, dto: ActualizarSensorDto): Promise<Sensor> {
    const actual = await this.obtenerSensorUseCase.execute(id);

    const nuevoRango = (dto.valorMinimoSensor !== undefined || dto.valorMaximoSensor !== undefined)
      ? RangoOperativo.crear(dto.valorMinimoSensor ?? actual.rango.minimo, dto.valorMaximoSensor ?? actual.rango.maximo)
      : actual.rango;

    const nuevaConexion = (dto.endpointUrl !== undefined || dto.mqttTopic !== undefined)
      ? ConfiguracionConexion.crear(actual.conexion.protocolo, dto.endpointUrl ?? actual.conexion.endpointUrl, dto.mqttTopic ?? actual.conexion.mqttTopic)
      : actual.conexion;

    const sensorActualizado = Sensor.desdePersistencia({
      ...actual.toProps(),
      nombreSensor: dto.nombreSensor ?? actual.nombreSensor,
      rango: nuevoRango,
      conexion: nuevaConexion,
      actualizadoEn: new Date(),
    });

    return this.sensorRepository.actualizar(id, sensorActualizado);
  }
}