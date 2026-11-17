import { IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class registrarUsoHerramientaDto {
    @IsInt()
    insumoId: number;
    
    @IsNumber()
    @Min(0.01)
    horasUsadas: number;

    @IsNumber()
    @Min(0)
    tasaDepreciacionHora: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    valorLibrosAntes: number; 

}