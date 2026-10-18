import {
    IsArray,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    MinLength,
    ValidateNested,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PuntoDto } from './punto.dto';
import { EstadoLote } from '../../../domain/entities/lote.entity';

export class CrearLoteDto {
    @IsString()
    @MinLength(1)
    nombre: string;

    @IsArray()
    @ArrayMinSize(3, { message: 'Un polígono necesita al menos 3 vértices' })
    @ValidateNested({ each: true })
    @Type(() => PuntoDto)
    vertices: PuntoDto[];

    @ValidateNested()
    @Type(() => PuntoDto)
    centroide: PuntoDto;

    @IsNumber()
    areaM2: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsInt()
    programaFormacionId?: number | null;
}

export class CambiarEstadoLoteDto {
    @IsEnum(EstadoLote)
    nuevoEstado: EstadoLote;
}