import { PartialType } from '@nestjs/mapped-types';
import { CreateVentasDetalleDto } from './create-ventas-detalle.dto';

export class UpdateVentasDetalleDto extends PartialType(CreateVentasDetalleDto) {}
