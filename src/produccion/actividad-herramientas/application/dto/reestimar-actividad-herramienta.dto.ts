import { IsNumber, Min } from "class-validator";

export class reEstimarHorasActividadHerramientaDto {
    @IsNumber()
    @Min(0.01)
    horasEstimadas: number;
}