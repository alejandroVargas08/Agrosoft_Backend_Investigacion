import { IsInt, IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CrearNotificacionDto {
  @IsInt() 
  @IsNotEmpty() 
  readonly usuarioId: number;

  @IsString() 
  @IsNotEmpty() 
  readonly titulo: string;

  @IsString() 
  @IsNotEmpty() 
  readonly mensaje: string;

  @IsString() 
  @IsNotEmpty() 
  readonly tipo: string;

  @IsOptional() 
  @IsObject() 
  readonly metadata?: Record<string, any>;
}