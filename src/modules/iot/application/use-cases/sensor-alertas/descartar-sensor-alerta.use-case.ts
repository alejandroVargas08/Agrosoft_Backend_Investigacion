import { Inject, Injectable } from '@nestjs/common';
import { SensorAlerta } from '../../../domain/entities/sensor-alerta.entity';
import type { SensorAlertaRepositoryPort } from '../../../domain/ports/sensor-alerta.repository.port';
import { SENSOR_ALERTA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-alerta.repository.token';
import { ObtenerSensorAlertaUseCase } from './obtener-sensor-alerta.use-case';

// Cierra una alerta a mano sin borrarla: queda en el historial como 'descartada'.
@Injectable()
export class DescartarSensorAlertaUseCase {
  constructor(
    @Inject(SENSOR_ALERTA_REPOSITORY_TOKEN)
    private readonly sensorAlertaRepository: SensorAlertaRepositoryPort,
    private readonly obtenerSensorAlertaUseCase: ObtenerSensorAlertaUseCase,
  ) {}

  async execute(id: number): Promise<SensorAlerta> {
    const alerta = await this.obtenerSensorAlertaUseCase.execute(id);
    alerta.descartar();
    return this.sensorAlertaRepository.guardar(alerta);
  }
}
