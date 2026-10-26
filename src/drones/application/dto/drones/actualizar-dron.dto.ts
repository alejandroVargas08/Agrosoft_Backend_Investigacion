import { IsString, IsIn, IsOptional, MinLength, IsBoolean } from "class-validator";

export class ActualizarDronDto{
    @IsOptional()@IsString() @MinLength(3)
    nombre?: string;

    @IsOptional()@IsString()
    modelo?: string;

    @IsOptional() @IsString()
    numeroSerie?: string;

    @IsOptional() @IsIn(['RGB', 'MULTIESPECTRAL'])
    tipoCamara?: 'RGB' | 'MULTIESPECTRAL';

    @IsOptional() @IsBoolean()
    tieneRtk?: boolean;

    @IsOptional() @IsBoolean()
    activo?: boolean;
}
