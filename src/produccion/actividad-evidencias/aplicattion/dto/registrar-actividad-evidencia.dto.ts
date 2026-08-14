import { IsArray, IsOptional, IsString } from "class-validator";

export class registrarActividadEvidenciaDto {
    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsArray()
    imagenes?: string[];
}