import { PartialType } from '@nestjs/mapped-types';
import { CrearTipoSensorDto } from './crear-tipo-sensor.dto';

export class ActualizarTipoSensorDto extends PartialType(CrearTipoSensorDto) {}