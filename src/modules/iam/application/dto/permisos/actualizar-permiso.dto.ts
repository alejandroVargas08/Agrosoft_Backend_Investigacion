import { IsOptional, IsString } from 'class-validator';

export class ActualizarPermisoDto {
  @IsString()
  @IsOptional()
  readonly nombre?: string;

  @IsString()
  @IsOptional()
  readonly descripcion?: string;
}