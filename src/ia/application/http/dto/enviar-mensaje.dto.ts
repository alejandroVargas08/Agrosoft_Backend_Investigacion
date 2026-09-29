import { IsInt, IsOptional, IsString } from 'class-validator';

export class EnviarMensajeDto {
  @IsString()
  readonly mensaje: string;
}

export class CrearConversacionDto {
  @IsInt()
  readonly usuarioId: number;

  @IsOptional()
  @IsString()
  readonly titulo?: string;
}