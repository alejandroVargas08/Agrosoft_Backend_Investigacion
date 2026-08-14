import { IsString, IsInt, IsOptional, MinLength, Min } from 'class-validator';

export class CrearTipoSensorDto {
  @IsString() @MinLength(2)
  nombre: string;

  @IsString()
  unidad: string;

  @IsInt() @Min(0)
  decimales: number;

  @IsOptional() @IsString()
  descripcion?: string;

  @IsOptional() @IsString()
  imagen?: string;

  @IsInt() @Min(1)
  ttlMinutos: number;
}