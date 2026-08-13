import { Inject, Injectable } from '@nestjs/common';
import { Sensor } from '../../../domain/entities/sensor.entity';
import type { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/sensor.repository.token';

@Injectable()
export class ListarSensoresUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY_TOKEN)
    private readonly sensorRepository: SensorRepositoryPort,
  ) {}

  async execute(): Promise<Sensor[]> {
    return this.sensorRepository.listarTodos();
  }
}