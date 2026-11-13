import { IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * Se deja fuera loteId: mover un cultivo de lote invalidaria sus cosechas y sus
 * actividades, que apuntan al lote original.
 */
export class ActualizarCultivoDto {
    @IsOptional() @IsString()
    nombreCultivo?: string;

    @IsOptional() @IsString()
    tipoCultivo?: string;

    @IsOptional() @IsInt()
    subLoteId?: number;

    @IsOptional() @IsDateString()
    fechaSiembra?: string;

    @IsOptional() @IsNumber() @Min(0)
    areaM2?: number;

    @IsOptional() @IsDateString()
    fechaFinalizacion?: string;

    @IsOptional() @IsNumber() @Min(0)
    costoEstimado?: number;

    /** Por qué se hizo el cambio. Queda en el historial de la unidad. */
    @IsOptional() @IsString() @MaxLength(300)
    motivo?: string;
}
