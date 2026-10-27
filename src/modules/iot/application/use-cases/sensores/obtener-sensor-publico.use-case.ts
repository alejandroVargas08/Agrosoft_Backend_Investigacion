import { Inject, Injectable } from '@nestjs/common';
import { ObtenerSensorUseCase } from './obtener-sensor.use-case';
import type { TipoSensorRepositoryPort } from '../../../domain/ports/tipo-sensor.repository.port';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-sensor.repository.token';
import { SensorPublico, aSensorPublico } from '../../dto/sensores/sensor-publico.response-dto';

/**
 * Version del sensor para la API. ObtenerSensorUseCase devuelve la entidad
 * porque cuatro use-cases internos la necesitan; este envuelve esa lectura y
 * la deja en la forma plana que consume el frontend.
 */
@Injectable()
export class ObtenerSensorPublicoUseCase {
  constructor(
    private readonly obtenerSensorUseCase: ObtenerSensorUseCase,
    @Inject(TIPO_SENSOR_REPOSITORY_TOKEN)
    private readonly tipoSensorRepository: TipoSensorRepositoryPort,
  ) {}

  async execute(id: number): Promise<SensorPublico> {
    const sensor = await this.obtenerSensorUseCase.execute(id);
    const tipo = await this.tipoSensorRepository.buscarPorId(sensor.tipoSensorId);
    return aSensorPublico(sensor, tipo);
  }
}
