import { IsNumber, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateVentaDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: string | Date;

  @IsNumber()
  @IsOptional()
  clienteId?: number;

  @IsNumber()
  @IsNotEmpty()
  subtotal: number;

  @IsNumber()
  @IsNotEmpty()
  impuestos: number;

  @IsNumber()
  @IsNotEmpty()
  descuento: number;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsString()
  @IsNotEmpty()
  estado: string;

  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;

  @IsNumber()
  @IsOptional()
  anuladaPorUsuarioId?: number;

  @IsDateString()
  @IsOptional()
  fechaAnulacion?: string | Date;
}