import { IsNumber, Min } from "class-validator";

export class actualizarActividadResponsableDto {
    @IsNumber()
    @Min(0.01)
    horas: number;
}