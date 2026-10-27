import { IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

/**
 * Antes era una interfaz: el ValidationPipe no puede validar una interfaz,
 * asi que POST /loteProduccion aceptaba cualquier JSON.
 */
export class CrearLoteProduccionDto {
    @IsInt()
    productoAgroId: number;

    @IsInt()
    cultivoId: number;

    @IsInt()
    loteId: number;

    @IsOptional() @IsInt()
    subLoteId?: number;

    @IsOptional() @IsInt()
    actividadesCosechaId?: number;

    @IsString()
    calidad: string;

    @IsNumber() @Min(0)
    cantidadKg: number;

    @IsNumber() @Min(0)
    stockDisponibleKg: number;

    @IsNumber() @Min(0)
    costoUnitarioKg: number;

    @IsNumber() @Min(0)
    costoTotal: number;

    @IsNumber() @Min(0)
    precioSugeridoKg: number;

    @IsOptional() @IsString() @MaxLength(60)
    destino?: string;

    @IsOptional() @IsString() @MaxLength(120)
    responsable?: string;

    @IsOptional() @IsString() @MaxLength(500)
    observaciones?: string;
}
