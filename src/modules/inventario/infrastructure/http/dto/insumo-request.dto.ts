import { IsEnum, IsInt, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { TipoInsumo } from '../../../domain/entities/insumo.entity';

export class CrearInsumoDto {
    @IsString()
    @MinLength(1)
    nombre: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsString()
    fotoUrl?: string;

    @IsString()
    presentacionTipo: string;

    @IsNumber()
    presentacionCantidad: number;

    @IsString()
    presentacionUnidad: string;

    @IsString()
    unidadUso: string;

    @IsOptional()
    @IsString()
    tipoMateria?: string;

    @IsNumber()
    factorConversionUso: number;

    @IsNumber()
    stockPresentacion: number;

    @IsNumber()
    stockUso: number;

    @IsNumber()
    stockMinimo: number;

    @IsNumber()
    precioUnitarioPresentacion: number;

    @IsNumber()
    precioUnitarioUso: number;

    @IsInt()
    almacenId: number;

    @IsInt()
    proveedorId: number;

    @IsInt()
    categoriaId: number;

    @IsEnum(TipoInsumo)
    tipoInsumo: TipoInsumo;

    @IsOptional()
    @IsNumber()
    costoAdquisicion?: number;

    @IsOptional()
    @IsNumber()
    valorResidual?: number;

    @IsOptional()
    @IsNumber()
    vidaUtilHoras?: number;

    @IsOptional()
    @IsInt()
    creadoPorUsuarioId?: number;
}