import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CrearEpaDto } from './crear-epa.dto';

export class ActualizarEpaDto extends PartialType(
  OmitType(CrearEpaDto, ['creadoPorUsuarioId'] as const),
) {}