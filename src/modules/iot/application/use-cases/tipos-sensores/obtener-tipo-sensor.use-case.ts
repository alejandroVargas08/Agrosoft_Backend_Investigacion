import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TipoSensor } from '../../../domain/entities/tipo-sensor.entity';
import type { TipoSensorRepositoryPort } from '../../../domain/ports/tipo-sensor.repository.port';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-sensor.repository.token';

@Injectable()
export class ObtenerTipoSensorUseCase {
  constructor(
    @Inject(TIPO_SENSOR_REPOSITORY_TOKEN)
    private readonly tipoSensorRepository: TipoSensorRepositoryPort,
  ) {}

  async execute(id: number): Promise<TipoSensor> {
    const tipoSensor = await this.tipoSensorRepository.buscarPorId(id);
    if (!tipoSensor) throw new NotFoundException(`No existe un tipo de sensor con id ${id}`);
    return tipoSensor;
  }
}