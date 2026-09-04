import { Inject, Injectable } from '@nestjs/common';
import type { TipoSensorRepositoryPort } from '../../../domain/ports/tipo-sensor.repository.port';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-sensor.repository.token';
import { ObtenerTipoSensorUseCase } from './obtener-tipo-sensor.use-case';

@Injectable()
export class EliminarTipoSensorUseCase {
  constructor(
    @Inject(TIPO_SENSOR_REPOSITORY_TOKEN)
    private readonly tipoSensorRepository: TipoSensorRepositoryPort,
    private readonly obtenerTipoSensorUseCase: ObtenerTipoSensorUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerTipoSensorUseCase.execute(id);
    await this.tipoSensorRepository.eliminar(id);
  }
}