import { Inject, Injectable } from '@nestjs/common';
import { SensorLectura } from '../../../domain/entities/sensor-lectura.entity';
import type { SensorLecturaRepositoryPort } from '../../../domain/ports/sensor-lectura.repository.port';
import { SENSOR_LECTURA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-lectura.repository.token';
import type { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../domain/ports/sensor.repository.token';
import { CrearSensorLecturaDto } from '../../dto/sensor-lecturas/crear-sensor-lectura.dto';
import { ObtenerSensorUseCase } from '../sensores/obtener-sensor.use-case';
import { SensorAlerta } from '../../../domain/entities/sensor-alerta.entity';
import type { ResultadoEvaluacion } from '../../../domain/value-objects/rango-operativo.vo';
import type { SensorAlertaRepositoryPort } from '../../../domain/ports/sensor-alerta.repository.port';
import { SENSOR_ALERTA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-alerta.repository.token';

@Injectable()
export class CrearSensorLecturaUseCase {
  constructor(
    @Inject(SENSOR_LECTURA_REPOSITORY_TOKEN)
    private readonly sensorLecturaRepository: SensorLecturaRepositoryPort,
    @Inject(SENSOR_REPOSITORY_TOKEN)
    private readonly sensorRepository: SensorRepositoryPort,
    private readonly obtenerSensorUseCase: ObtenerSensorUseCase,
    @Inject(SENSOR_ALERTA_REPOSITORY_TOKEN)
    private readonly sensorAlertaRepository: SensorAlertaRepositoryPort,
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

    // 4. La lectura decide el estado de las alertas del sensor
    await this.revisarAlertas(sensor.loteId, sensor.subLoteId, sensor.rango.evaluar(Number(dto.valor)), dto);

    return lecturaGuardada;
  }

  /**
   * Fuera de rango y sin alerta abierta: se abre una (una sola por sensor, para
   * no llenar la bandeja con cada lectura). De vuelta en el rango: las alertas
   * abiertas pasan a "normalizada" con el valor que las cerro.
   */
  private async revisarAlertas(
    loteId: number | null,
    subLoteId: number | null,
    evaluacion: ResultadoEvaluacion,
    dto: CrearSensorLecturaDto,
  ): Promise<void> {
    const fecha = new Date(dto.fechaLectura);
    const activas = await this.sensorAlertaRepository.listarActivasPorSensor(dto.sensorId);

    if (!evaluacion.violado || evaluacion.tipo === null || evaluacion.umbral === null) {
      for (const alerta of activas) {
        alerta.normalizar(Number(dto.valor), fecha);
        await this.sensorAlertaRepository.guardar(alerta);
      }
      return;
    }

    if (activas.length > 0) return;
    await this.sensorAlertaRepository.guardar(
      SensorAlerta.crear({
        sensorId: dto.sensorId,
        valor: Number(dto.valor),
        umbral: evaluacion.umbral,
        tipo: evaluacion.tipo,
        fechaAlerta: fecha,
        loteId,
        subLoteId,
      }),
    );
  }
}