import { IsInt, IsNotEmpty, IsNumber, Min } from "class-validator";

export class registrarActividadInsumoDto {
    @IsInt()
    insumoId: number;

    @IsNumber()
    @Min(0.01)
    cantidadUsada: number;

    @IsString()
    @IsNotEmpty()
    unidad: string;

    @IsNumber()
    @Min(0)
    constoUnitario: number; 
}