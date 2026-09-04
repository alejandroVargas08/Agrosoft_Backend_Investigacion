import { IsString, IsInt, IsIn, IsOptional, IsNumber, IsUrl, MinLength } from 'class-validator';

export class CrearSensorDto {
  @IsString() @MinLength(3)
  nombreSensor: string;

  @IsInt()
  tipoSensorId: number;

  @IsIn(['HTTP', 'MQTT'])
  protocolo: 'HTTP' | 'MQTT';

  @IsOptional() @IsUrl()
  endpointUrl?: string;

  @IsOptional() @IsString()
  mqttTopic?: string;

  @IsNumber()
  valorMinimoSensor: number;

  @IsNumber()
  valorMaximoSensor: number;

  @IsOptional() @IsInt()
  cultivoId?: number;

  @IsOptional() @IsInt()
  globalConfigId?: number;

  @IsOptional() @IsInt()
  loteId?: number;

  @IsOptional() @IsInt()
  subLoteId?: number;

  @IsInt()
  creadoPorUsuarioId: number;
}