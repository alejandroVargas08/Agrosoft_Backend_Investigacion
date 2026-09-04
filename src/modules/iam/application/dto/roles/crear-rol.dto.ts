import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearRolDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsOptional()
  readonly descripcion?: string;

  @IsBoolean()
  @IsOptional()
  readonly esSistema?: boolean;
}