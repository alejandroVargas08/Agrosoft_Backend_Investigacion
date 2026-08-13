import { PartialType } from '@nestjs/mapped-types';
import { CrearIotGlobalConfigDto } from './crear-iot-global-config.dto';

export class ActualizarIotGlobalConfigDto extends PartialType(CrearIotGlobalConfigDto) {}