import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CrearSensorLecturaDto {
  @IsInt()
  sensorId: number;

  @IsString()
  valor: string;

  @IsDateString()
  fechaLectura: string;

  @IsString()
  unidad: string;

  @IsOptional() @IsString()
  observaciones?: string;
}