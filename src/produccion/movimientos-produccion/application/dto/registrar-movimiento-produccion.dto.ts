import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { type tipoMovimientoProduccion } from "../../domain/entities/movimiento-produccion.entity";

export class registrarMovimientoProduccionDto {
    @IsIn(['entrada', 'salida'])
    tipo: tipoMovimientoProduccion;

    @IsNumber()
    @Min(0.01)
    cantidadKg: number;

    @IsNumber()
    @Min(0)
    costoUnitarioKg: number;

    @IsNumber()
    @Min(0)
    precioUnitarioKg: number;

    @IsOptional()
    @IsInt()
    ventaId?: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsInt()
    usuarioId: number;

}