import { Inject, Injectable } from '@nestjs/common';
import type { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/sensor.repository.token';
import { ObtenerSensorUseCase } from './obtener-sensor.use-case';

@Injectable()
export class EliminarSensorUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY_TOKEN)
    private readonly sensorRepository: SensorRepositoryPort,
    private readonly obtenerSensorUseCase: ObtenerSensorUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerSensorUseCase.execute(id);
    await this.sensorRepository.eliminar(id);
  }
}