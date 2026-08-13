import { Inject, Injectable } from '@nestjs/common';
import type { SensorAlertaRepositoryPort } from '../../../domain/ports/sensor-alerta.repository.port';
import { SENSOR_ALERTA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-alerta.repository.token';
import { ObtenerSensorAlertaUseCase } from './obtener-sensor-alerta.use-case';

@Injectable()
export class EliminarSensorAlertaUseCase {
  constructor(
    @Inject(SENSOR_ALERTA_REPOSITORY_TOKEN)
    private readonly sensorAlertaRepository: SensorAlertaRepositoryPort,
    private readonly obtenerSensorAlertaUseCase: ObtenerSensorAlertaUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerSensorAlertaUseCase.execute(id);
    await this.sensorAlertaRepository.eliminar(id);
  }
}