import { IsInt, IsNumber, Min } from "class-validator";

export class registrarActividadResponsableDto {
    @IsInt()
    usuarioId: number;

    @IsNumber()
    @Min(0.01)
    horas: number;

    @IsNumber()
    @Min(0)
    precioHora: number;
}