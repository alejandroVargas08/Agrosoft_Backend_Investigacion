import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Sensor } from '../../../domain/entities/sensor.entity';
import type { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/sensor.repository.token';

@Injectable()
export class ObtenerSensorUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY_TOKEN)
    private readonly sensorRepository: SensorRepositoryPort,
  ) {}

  async execute(id: number): Promise<Sensor> {
    const sensor = await this.sensorRepository.buscarPorId(id);
    if (!sensor) throw new NotFoundException(`No existe un sensor con id ${id}`);
    return sensor;
  }
}