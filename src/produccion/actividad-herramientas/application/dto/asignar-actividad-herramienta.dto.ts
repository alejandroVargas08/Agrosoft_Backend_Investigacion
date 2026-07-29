import { IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class asignarActividadHerramientaDto {
    @IsInt()
    insumoId: number; 

    @IsOptional()
    @IsInt()
    activoFijoId: number;

    @IsNumber()
    @Min(0.01)
    horasEstimadas: number;
}