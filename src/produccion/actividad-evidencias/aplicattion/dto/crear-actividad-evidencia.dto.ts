import { IsString, IsUrl } from "class-validator";

export class agregarImagenEvidenciaDto {
    @IsString()
    @IsUrl()
    url: string;
}