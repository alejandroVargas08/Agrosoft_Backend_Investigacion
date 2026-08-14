import { Inject, Injectable } from '@nestjs/common';
import { TipoSensor } from '../../../domain/entities/tipo-sensor.entity';
import type { TipoSensorRepositoryPort } from '../../../domain/ports/tipo-sensor.repository.port';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-sensor.repository.token';

@Injectable()
export class ListarTiposSensoresUseCase {
  constructor(
    @Inject(TIPO_SENSOR_REPOSITORY_TOKEN)
    private readonly tipoSensorRepository: TipoSensorRepositoryPort,
  ) {}

  async execute(): Promise<TipoSensor[]> {
    return this.tipoSensorRepository.listarTodos();
  }
}