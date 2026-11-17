import { IsOptional, IsString, IsEmail, IsIn, IsBoolean, MaxLength } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  readonly nombre?: string;

  @IsOptional()
  @IsString()
  readonly apellido?: string;

  @IsOptional()
  @IsEmail()
  readonly correo?: string;

  @IsOptional()
  @IsString()
  readonly telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  readonly ubicacion?: string;

  @IsOptional()
  @IsIn(['activo', 'inactivo', 'suspendido', 'pendiente', 'rechazado'])
  readonly estado?: string;

  // Verificacion en dos pasos. El controller ya valida que seas tu o un admin.
  @IsOptional()
  @IsBoolean()
  readonly dosPasosActivo?: boolean;
}