import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearPermisoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsOptional()
  readonly descripcion?: string;
}