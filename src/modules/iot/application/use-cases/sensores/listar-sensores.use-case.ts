import { Inject, Injectable } from '@nestjs/common';
import type { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/sensor.repository.token';
import type { TipoSensorRepositoryPort } from '../../../domain/ports/tipo-sensor.repository.port';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-sensor.repository.token';
import { SensorPublico, aSensorPublico } from '../../dto/sensores/sensor-publico.response-dto';

@Injectable()
export class ListarSensoresUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY_TOKEN)
    private readonly sensorRepository: SensorRepositoryPort,
    @Inject(TIPO_SENSOR_REPOSITORY_TOKEN)
    private readonly tipoSensorRepository: TipoSensorRepositoryPort,
  ) {}

  async execute(): Promise<SensorPublico[]> {
    const [sensores, tipos] = await Promise.all([
      this.sensorRepository.listarTodos(),
      this.tipoSensorRepository.listarTodos(),
    ]);

    const porId = new Map(tipos.filter((t) => t.id !== null).map((t) => [t.id as number, t]));

    return sensores.map((sensor) => aSensorPublico(sensor, porId.get(sensor.tipoSensorId) ?? null));
  }
}
