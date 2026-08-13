import { IsInt, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CrearSensorAlertaDto {
  @IsInt()
  sensorId: number;

  @IsNumber()
  valor: number;

  @IsDateString()
  fechaAlerta: string;

  @IsOptional() @IsInt()
  loteId?: number;

  @IsOptional() @IsInt()
  subLoteId?: number;
}