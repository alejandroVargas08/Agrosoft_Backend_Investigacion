import {
    IsArray,
    IsEnum,
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
}

export class CambiarEstadoLoteDto {
    @IsEnum(EstadoLote)
    nuevoEstado: EstadoLote;
}