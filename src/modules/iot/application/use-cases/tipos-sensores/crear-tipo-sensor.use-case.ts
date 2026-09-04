import { Inject, Injectable } from '@nestjs/common';
import { TipoSensor } from '../../../domain/entities/tipo-sensor.entity';
import type { TipoSensorRepositoryPort } from '../../../domain/ports/tipo-sensor.repository.port';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-sensor.repository.token';
import { CrearTipoSensorDto } from '../../dto/tipos-sensores/crear-tipo-sensor.dto';

@Injectable()
export class CrearTipoSensorUseCase {
  constructor(
    @Inject(TIPO_SENSOR_REPOSITORY_TOKEN)
    private readonly tipoSensorRepository: TipoSensorRepositoryPort,
  ) {}

  async execute(dto: CrearTipoSensorDto): Promise<TipoSensor> {
    const tipoSensor = TipoSensor.crear({
      nombre: dto.nombre,
      unidad: dto.unidad,
      decimales: dto.decimales,
      descripcion: dto.descripcion ?? null,
      imagen: dto.imagen ?? null,
      ttlMinutos: dto.ttlMinutos,
    });

    return this.tipoSensorRepository.guardar(tipoSensor);
  }
}