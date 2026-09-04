import { Inject, Injectable } from '@nestjs/common';
import { TipoSensor } from '../../../domain/entities/tipo-sensor.entity';
import type { TipoSensorRepositoryPort } from '../../../domain/ports/tipo-sensor.repository.port';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-sensor.repository.token';
import { ActualizarTipoSensorDto } from '../../dto/tipos-sensores/actualizar-tipo-sensor.dto';
import { ObtenerTipoSensorUseCase } from './obtener-tipo-sensor.use-case';

@Injectable()
export class ActualizarTipoSensorUseCase {
  constructor(
    @Inject(TIPO_SENSOR_REPOSITORY_TOKEN)
    private readonly tipoSensorRepository: TipoSensorRepositoryPort,
    private readonly obtenerTipoSensorUseCase: ObtenerTipoSensorUseCase,
  ) {}

  async execute(id: number, dto: ActualizarTipoSensorDto): Promise<TipoSensor> {
    const actual = await this.obtenerTipoSensorUseCase.execute(id);
    actual.actualizarDatos(dto);
    return this.tipoSensorRepository.actualizar(id, actual);
  }
}