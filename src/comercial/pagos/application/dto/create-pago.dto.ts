import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  @IsNotEmpty()
  ventaId: number;

  @IsString()
  @IsNotEmpty()
  metodo: string;

  @IsNumber()
  @IsNotEmpty()
  monto: number;

  @IsString()
  @IsNotEmpty()
  moneda: string;

  @IsString()
  @IsOptional()
  referencia?: string;
}