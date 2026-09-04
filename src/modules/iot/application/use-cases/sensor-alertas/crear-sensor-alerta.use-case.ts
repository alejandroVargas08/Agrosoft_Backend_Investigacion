import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SensorAlerta } from '../../../domain/entities/sensor-alerta.entity';
import type { SensorAlertaRepositoryPort } from '../../../domain/ports/sensor-alerta.repository.port';
import { SENSOR_ALERTA_REPOSITORY_TOKEN } from '../../../domain/ports/sensor-alerta.repository.token';
import { CrearSensorAlertaDto } from '../../dto/sensor-alertas/crear-sensor-alerta.dto';
import { ObtenerSensorUseCase } from '../sensores/obtener-sensor.use-case';

@Injectable()
export class CrearSensorAlertaUseCase {
  constructor(
    @Inject(SENSOR_ALERTA_REPOSITORY_TOKEN)
    private readonly sensorAlertaRepository: SensorAlertaRepositoryPort,
    private readonly obtenerSensorUseCase: ObtenerSensorUseCase,
  ) {}

  async execute(dto: CrearSensorAlertaDto): Promise<SensorAlerta> {
    // 1. Traemos el sensor real, con su RangoOperativo ya validado
    const sensor = await this.obtenerSensorUseCase.execute(dto.sensorId);

    // 2. Le preguntamos al dominio si este valor realmente viola el rango
    const evaluacion = sensor.rango.evaluar(dto.valor);

    // 3. Si no hay violación, no tiene sentido crear una alerta
    if (!evaluacion.violado || evaluacion.tipo === null || evaluacion.umbral === null) {
      throw new BadRequestException(
        `El valor ${dto.valor} está dentro del rango permitido (${sensor.rango.minimo}-${sensor.rango.maximo}); no se genera alerta`,
      );
    }

    // 4. Recién aquí armamos la alerta, con el umbral y tipo calculados por el dominio
    const alerta = SensorAlerta.crear({
      sensorId: dto.sensorId,
      valor: dto.valor,
      umbral: evaluacion.umbral,
      tipo: evaluacion.tipo,
      fechaAlerta: new Date(dto.fechaAlerta),
      loteId: dto.loteId ?? sensor.loteId,
      subLoteId: dto.subLoteId ?? sensor.subLoteId,
    });

    return this.sensorAlertaRepository.guardar(alerta);
  }
}