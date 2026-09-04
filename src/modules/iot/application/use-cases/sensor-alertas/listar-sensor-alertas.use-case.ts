import { Inject, Injectable } from '@nestjs/common';
import { SensorAlerta } from '../../../domain/entities/sensor-alerta.entity';
import type { SensorAlertaRepositoryPort } from '../../../domain/ports/sensor-alerta.repository.port';
import { SENSOR_ALERTA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-alerta.repository.token';

@Injectable()
export class ListarSensorAlertasUseCase {
  constructor(
    @Inject(SENSOR_ALERTA_REPOSITORY_TOKEN)
    private readonly sensorAlertaRepository: SensorAlertaRepositoryPort,
  ) {}

  async execute(): Promise<SensorAlerta[]> {
    return this.sensorAlertaRepository.listarTodos();
  }
}