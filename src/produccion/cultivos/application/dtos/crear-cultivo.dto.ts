import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

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

    @IsOptional() @IsNumber() @Min(0)
    areaM2?: number;
}