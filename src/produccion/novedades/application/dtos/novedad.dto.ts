import { IsIn, IsInt, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import type { TipoNovedad, UrgenciaNovedad } from '../../domain/entities/novedad.entity';

const TIPOS: TipoNovedad[] = ['insumo_bajo', 'herramienta_danada', 'problema_cultivo', 'otro'];
const URGENCIAS: UrgenciaNovedad[] = ['low', 'medium', 'high'];

export class ReportarNovedadDto {
    @IsIn(TIPOS)
    readonly tipo: TipoNovedad;

    @IsIn(URGENCIAS)
    readonly urgencia: UrgenciaNovedad;

    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    readonly descripcion: string;

    /** La tarea en la que apareció, si fue durante una. */
    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly actividadId?: number;

    /** El insumo que se está acabando, cuando el tipo es insumo_bajo. */
    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly insumoId?: number;

    /** El nombre de la herramienta, cuando el tipo es herramienta_danada. */
    @IsOptional()
    @IsString()
    @MaxLength(150)
    readonly nombreHerramienta?: string;
}

/** Al descartar hay que decir por que: el aprendiz tiene que saberlo. */
export class ResponderNovedadDto {
    @IsString()
    @MinLength(3)
    @MaxLength(1000)
    readonly respuesta: string;
}

/**
 * Al atender, en cambio, la respuesta es opcional, como en el diseño: dar algo
 * por resuelto no siempre necesita explicacion. Sin MinLength a proposito, para
 * que un campo que quedo en blanco no sea un error sino una respuesta vacia.
 */
export class AtenderNovedadDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    readonly respuesta?: string;
}
