import { IsInt, IsNumber, Min } from "class-validator";

export class reservaActividadInsumoDto {
    @IsInt()
    insumoId: number;

    @IsNumber()
    @Min(0.01)
    cantidadReservada: number; 
}