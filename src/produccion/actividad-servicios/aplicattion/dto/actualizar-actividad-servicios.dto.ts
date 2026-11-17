import {IsNumber, Min } from "class-validator";

export class actualizarActividadServicioDto {
    @IsNumber()
    @Min(0.01)
    horas: number;
}