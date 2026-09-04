import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SensorAlerta } from '../../../domain/entities/sensor-alerta.entity';
import type { SensorAlertaRepositoryPort } from '../../../domain/ports/sensor-alerta.repository.port';
import { SENSOR_ALERTA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-alerta.repository.token';

@Injectable()
export class ObtenerSensorAlertaUseCase {
  constructor(
    @Inject(SENSOR_ALERTA_REPOSITORY_TOKEN)
    private readonly sensorAlertaRepository: SensorAlertaRepositoryPort,
  ) {}

  async execute(id: number): Promise<SensorAlerta> {
    const alerta = await this.sensorAlertaRepository.buscarPorId(id);
    if (!alerta) throw new NotFoundException(`No existe una alerta con id ${id}`);
    return alerta;
  }
}