import { IsNumber, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateFacturaDto {
  @IsNumber()
  @IsNotEmpty()
  ventaId: number;

  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsString()
  @IsNotEmpty()
  prefijo: string;

  @IsDateString()
  @IsNotEmpty()
  fechaEmision: string | Date;

  @IsDateString()
  @IsNotEmpty()
  vencimiento: string | Date;

  @IsString()
  @IsOptional()
  qrUrl?: string;

  @IsString()
  @IsOptional()
  pdfUrl?: string;
}