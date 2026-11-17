import { IsString, IsNumber, IsOptional, IsISO8601 } from 'class-validator';

export class CreateTransaccionesFinancieraDto {
  @IsString()
  tipo: string;

  @IsString()
  categoria: string;

  @IsNumber()
  monto: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsISO8601()
  fecha: string;

  @IsNumber()
  @IsOptional()
  actividadId?: number;

  @IsNumber()
  @IsOptional()
  insumoId?: number;

  @IsNumber()
  @IsOptional()
  ventaId?: number;

  @IsNumber()
  @IsOptional()
  usuarioId?: number;
}