import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateVentaDetalleDto {
@IsNumber()
ventaId: number;

@IsNumber()
productoAgroId: number;

@IsOptional()
@IsNumber()
loteProduccionId?: number;

@IsOptional()
@IsNumber()
cultivoId?: number;

@IsNumber()
@IsPositive()
cantidadKg: number;

@IsNumber()
@IsPositive()
precioUnitarioKg: number;

@IsOptional()
@IsNumber()
costoUnitarioKg?: number;
}