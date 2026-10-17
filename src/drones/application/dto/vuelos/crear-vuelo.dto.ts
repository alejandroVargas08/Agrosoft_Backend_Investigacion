import { IsString, IsInt, IsOptional, IsDateString, IsNumber, Min, MinLength } from 'class-validator';

export class CrearVueloDto {
  @IsInt()
  dronId: number;

  @IsString() @MinLength(3)
  nombre: string;

  @IsDateString()
  fechaVuelo: string;

  @IsOptional() @IsNumber() @Min(1)
  alturaVueloM?: number;

  @IsInt()
  loteId: number;

  @IsOptional() @IsInt()
  subLoteId?: number;

  @IsOptional() @IsInt()
  cultivoId?: number;

  @IsOptional() @IsString()
  observaciones?: string;

  @IsInt()
  creadoPorUsuarioId: number;
}
