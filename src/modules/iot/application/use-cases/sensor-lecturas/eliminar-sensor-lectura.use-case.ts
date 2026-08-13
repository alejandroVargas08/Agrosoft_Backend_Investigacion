import { Inject, Injectable } from '@nestjs/common';
import type { SensorLecturaRepositoryPort } from '../../../domain/ports/sensor-lectura.repository.port';
import { SENSOR_LECTURA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-lectura.repository.token';
import { ObtenerSensorLecturaUseCase } from './obtener-sensor-lectura.use-case';

@Injectable()
export class EliminarSensorLecturaUseCase {
  constructor(
    @Inject(SENSOR_LECTURA_REPOSITORY_TOKEN)
    private readonly sensorLecturaRepository: SensorLecturaRepositoryPort,
    private readonly obtenerSensorLecturaUseCase: ObtenerSensorLecturaUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerSensorLecturaUseCase.execute(id);
    await this.sensorLecturaRepository.eliminar(id);
  }
}