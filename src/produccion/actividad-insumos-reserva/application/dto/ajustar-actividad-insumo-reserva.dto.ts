import { IsNumber, Min } from "class-validator";

export class ajustarActividadInsumoReservaDto {
    @IsNumber()
    @Min(0.01)
    cantidadReserva: number;
}