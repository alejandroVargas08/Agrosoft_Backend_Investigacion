import { PartialType } from '@nestjs/mapped-types';
import { CrearLoteProduccionDto } from './crear-lote.produccion.dto';

export class ActualizarLoteProduccionDto extends PartialType(CrearLoteProduccionDto) {}
