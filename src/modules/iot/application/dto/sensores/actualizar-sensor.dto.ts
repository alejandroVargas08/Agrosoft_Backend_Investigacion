import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CrearSensorDto } from './crear-sensor.dto';

export class ActualizarSensorDto extends PartialType(
  OmitType(CrearSensorDto, ['creadoPorUsuarioId', 'tipoSensorId'] as const),
) {}