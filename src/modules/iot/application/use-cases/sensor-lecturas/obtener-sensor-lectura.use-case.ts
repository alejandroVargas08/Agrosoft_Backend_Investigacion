import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SensorLectura } from '../../../domain/entities/sensor-lectura.entity';
import type { SensorLecturaRepositoryPort } from '../../../domain/ports/sensor-lectura.repository.port';
import { SENSOR_LECTURA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-lectura.repository.token';

@Injectable()
export class ObtenerSensorLecturaUseCase {
  constructor(
    @Inject(SENSOR_LECTURA_REPOSITORY_TOKEN)
    private readonly sensorLecturaRepository: SensorLecturaRepositoryPort,
  ) {}

  async execute(id: number): Promise<SensorLectura> {
    const lectura = await this.sensorLecturaRepository.buscarPorId(id);
    if (!lectura) throw new NotFoundException(`No existe una lectura con id ${id}`);
    return lectura;
  }
}