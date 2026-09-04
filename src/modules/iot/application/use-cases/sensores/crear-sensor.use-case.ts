import { Inject, Injectable } from '@nestjs/common';
import { Sensor } from '../../../domain/entities/sensor.entity';
import { RangoOperativo } from '../../../domain/value-objects/rango-operativo.vo';
import { ConfiguracionConexion } from '../../../domain/value-objects/configuracion-conexion.vo';
import type { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/sensor.repository.token';
import { CrearSensorDto } from '../../dto/sensores/crear-sensor.dto';

@Injectable()
export class CrearSensorUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY_TOKEN)
    private readonly sensorRepository: SensorRepositoryPort,
  ) {}

  async execute(dto: CrearSensorDto): Promise<Sensor> {
    const sensor = Sensor.crear({
      nombreSensor: dto.nombreSensor,
      tipoSensorId: dto.tipoSensorId,
      conexion: ConfiguracionConexion.crear(dto.protocolo, dto.endpointUrl ?? null, dto.mqttTopic ?? null),
      rango: RangoOperativo.crear(dto.valorMinimoSensor, dto.valorMaximoSensor),
      estado: null,
      cultivoId: dto.cultivoId ?? null,
      creadoPorUsuarioId: dto.creadoPorUsuarioId,
      globalConfigId: dto.globalConfigId ?? null,
      loteId: dto.loteId ?? null,
      subLoteId: dto.subLoteId ?? null,
    });

    return this.sensorRepository.guardar(sensor);
  }
}