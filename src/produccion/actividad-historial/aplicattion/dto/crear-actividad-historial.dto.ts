import { IsInt, IsNotEmpty, IsString } from "class-validator";
import { type cambioRegistrado } from "../../domain/entities/actividad-historial.entity";

export class crearActividadHistorialDto {
    @IsInt()
    @IsNotEmpty()
    actividadId: number;

    @IsInt()
    @IsNotEmpty()
    cultivoId: number;

    @IsInt()
    @IsNotEmpty()
    usuarioId: number;

    @IsString()
    @IsNotEmpty()
    motivo: string;

    @IsString()
    @IsNotEmpty()
    cambios: cambioRegistrado;
}