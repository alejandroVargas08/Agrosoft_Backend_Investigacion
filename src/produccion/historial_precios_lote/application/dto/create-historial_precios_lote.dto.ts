import { IsNumber, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateHistorialPreciosLoteDto {
  @IsNumber()
  @IsNotEmpty()
  loteProduccionId: number;

  @IsNumber()
  @IsNotEmpty()
  precioAnterior: number;

  @IsNumber()
  @IsNotEmpty()
  precioNuevo: number;

  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;

  @IsNumber()
  @IsOptional()
  ventaId?: number;

  @IsDateString()
  @IsNotEmpty()
  fecha: string | Date;

  @IsString()
  @IsOptional()
  razon?: string;
}