import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class CrearCultivoDto {

    @IsString()
    nombreCultivo: string;

    @IsString()
    tipoCultivo: string;

    @IsInt()
    loteId: number;

    @IsOptional() @IsInt()
    subLoteId?: number;

    @IsDateString()
    fechaSiembra: string;
}