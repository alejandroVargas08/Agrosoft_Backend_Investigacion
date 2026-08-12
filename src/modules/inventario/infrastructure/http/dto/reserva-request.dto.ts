import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CrearReservaDto {
    @IsInt()
    insumoId: number;

    @IsNumber()
    cantidad: number;

    @IsDateString()
    fechaReserva: string;

    @IsOptional()
    @IsString()
    motivo?: string;

    @IsInt()
    usuarioId: number;

    @IsOptional()
    @IsInt()
    actividadId?: number;
}