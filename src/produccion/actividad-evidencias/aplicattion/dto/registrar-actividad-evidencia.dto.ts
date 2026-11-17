import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class registrarActividadEvidenciaDto {
    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsArray()
    imagenes?: string[];

    /** La entrega del aprendiz a la que pertenece. Opcional. */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    asignacionId?: number;
}