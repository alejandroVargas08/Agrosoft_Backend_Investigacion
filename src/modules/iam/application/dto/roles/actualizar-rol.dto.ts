import { IsOptional, IsString } from 'class-validator';

export class ActualizarRolDto {
  @IsString()
  @IsOptional()
  readonly nombre?: string;

  @IsString()
  @IsOptional()
  readonly descripcion?: string;
}