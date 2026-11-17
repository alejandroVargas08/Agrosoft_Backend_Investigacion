import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CrearTratamientoDto {
    @IsOptional() @IsInt()
    incidenciaId?: number;

    @IsString()
    producto: string;

    @IsOptional() @IsString()
    dosis?: string;

    @IsOptional() @IsDateString()
    fecha?: string;

    @IsOptional() @IsNumber() @Min(0)
    costo?: number;

    @IsOptional() @IsString()
    notas?: string;
}

export class CambiarEstadoTratamientoDto {
    @IsIn(['scheduled', 'applied'])
    estado: 'scheduled' | 'applied';
}