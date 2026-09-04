import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoMovimiento } from '../../../domain/entities/movimiento-insumo.entity';

export class RegistrarMovimientoDto {
    @IsInt()
    insumoId: number;

    @IsEnum(TipoMovimiento)
    tipo: TipoMovimiento;

    @IsNumber()
    cantidadPresentacion: number;

    @IsNumber()
    cantidadUso: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsInt()
    actividadId?: number;

    @IsInt()
    usuarioId: number;

    @IsOptional()
    @IsInt()
    almacenOrigenId?: number;

    @IsOptional()
    @IsInt()
    almacenDestinoId?: number;
}