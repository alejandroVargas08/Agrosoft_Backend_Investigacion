import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialPreciosLoteDto } from '../../application/dto/create-historial_precios_lote.dto';

export class UpdateHistorialPreciosLoteDto extends PartialType(CreateHistorialPreciosLoteDto) {}