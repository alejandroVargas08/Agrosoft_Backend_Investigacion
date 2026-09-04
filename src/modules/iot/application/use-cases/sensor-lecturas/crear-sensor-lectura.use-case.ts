import { Inject, Injectable } from '@nestjs/common';
import { SensorLectura } from '../../../domain/entities/sensor-lectura.entity';
import type { SensorLecturaRepositoryPort } from '../../../domain/ports/sensor-lectura.repository.port';
import { SENSOR_LECTURA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-lectura.repository.token';
import type { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/sensor.repository.token';
import { CrearSensorLecturaDto } from '../../dto/sensor-lecturas/crear-sensor-lectura.dto';
import { ObtenerSensorUseCase } from '../sensores/obtener-sensor.use-case';

@Injectable()
export class CrearSensorLecturaUseCase {
  constructor(
    @Inject(SENSOR_LECTURA_REPOSITORY_TOKEN)
    private readonly sensorLecturaRepository: SensorLecturaRepositoryPort,
    @Inject(SENSOR_REPOSITORY_TOKEN)
    private readonly sensorRepository: SensorRepositoryPort,
    private readonly obtenerSensorUseCase: ObtenerSensorUseCase,
  ) {}

  async execute(dto: CrearSensorLecturaDto): Promise<SensorLectura> {
    // 1. Verificamos que el sensor exista de verdad (lanza 404 si no)
    const sensor = await this.obtenerSensorUseCase.execute(dto.sensorId);

    // 2. Guardamos la lectura como un hecho histórico
    const lectura = SensorLectura.crear({
      sensorId: dto.sensorId,
      valor: dto.valor,
      fechaLectura: new Date(dto.fechaLectura),
      unidad: dto.unidad,
      observaciones: dto.observaciones ?? null,
    });
    const lecturaGuardada = await this.sensorLecturaRepository.guardar(lectura);

    // 3. Actualizamos el "estado en vivo" del sensor con esta nueva lectura
    sensor.registrarLectura(dto.valor, new Date(dto.fechaLectura));
    await this.sensorRepository.actualizar(dto.sensorId, sensor);

    return lecturaGuardada;
  }
}