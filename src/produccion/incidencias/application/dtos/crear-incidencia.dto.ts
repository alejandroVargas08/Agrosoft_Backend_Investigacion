import { IsDateString, IsIn, IsInt, IsOptional, IsString } from "class-validator";

export class CrearIncidenciaDto {
    @IsString()
    titulo: string;

    @IsString()
    tipo: string;

    @IsIn(['low', 'medium', 'high'])
    severidad: 'low' | 'medium' | 'high';

    @IsOptional() @IsInt()
    cultivoId?: number;

    @IsOptional() @IsDateString()
    fecha?: string;

    @IsOptional() @IsString()
    descripcion?: string;
}

export class CambiarEstadoIncidenciaDto {
    @IsIn(['open', 'in_treatment', 'resolved'])
    estado: 'open' | 'in_treatment' | 'resolved';
}