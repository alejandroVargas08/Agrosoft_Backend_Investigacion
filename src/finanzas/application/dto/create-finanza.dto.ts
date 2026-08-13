import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum TipoFinanza {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
}

export class CreateFinanzaDto {
  @IsEnum(TipoFinanza)
  tipo: TipoFinanza;

  @IsNumber()
  monto: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  ventaId?: number;
}