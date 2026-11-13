import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, MinLength, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PuntoDto } from './punto.dto';

export class ActualizarTerrenoDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    nombre?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(3, { message: 'Un polígono necesita al menos 3 vértices' })
    @ValidateNested({ each: true })
    @Type(() => PuntoDto)
    vertices?: PuntoDto[];

    @ValidateIf((dto: ActualizarTerrenoDto) => !!dto.vertices)
    @ValidateNested()
    @Type(() => PuntoDto)
    centroide?: PuntoDto;

    @ValidateIf((dto: ActualizarTerrenoDto) => !!dto.vertices)
    @IsNumber()
    areaM2?: number;
}
