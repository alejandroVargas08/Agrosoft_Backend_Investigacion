import { IsOptional, IsString, MinLength } from 'class-validator';

export class CrearAlmacenDto {
    @IsString()
    @MinLength(1)
    nombre: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsString()
    ubicacion?: string;
    }

    export class CrearCategoriaDto {
    @IsString()
    @MinLength(1)
    nombre: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsString()
    tipoInsumo: string;
    }

    export class CrearProveedorDto {
    @IsString()
    @MinLength(1)
    nombre: string;
}