import { IsInt, IsNumber, Min } from "class-validator";

export class registrarInsumoUsoDto {
    @IsInt()
    insumoId: number;

    @IsNumber()
    @Min(0.01)
    cantidadUso: number;

    @IsNumber()
    @Min(0)
    costoUnitarioUso: number; 
}