import { Inject, Injectable } from '@nestjs/common';
import { SensorLectura } from '../../../domain/entities/sensor-lectura.entity';
import type { SensorLecturaRepositoryPort } from '../../../domain/ports/sensor-lectura.repository.port';
import { SENSOR_LECTURA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-lectura.repository.token';

@Injectable()
export class ListarLecturasPorSensorUseCase {
  constructor(
    @Inject(SENSOR_LECTURA_REPOSITORY_TOKEN)
    private readonly sensorLecturaRepository: SensorLecturaRepositoryPort,
  ) {}

  async execute(sensorId: number): Promise<SensorLectura[]> {
    return this.sensorLecturaRepository.listarPorSensorId(sensorId);
  }
}