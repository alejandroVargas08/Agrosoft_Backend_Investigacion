import { IsOptional, IsString, IsEmail, IsIn } from 'class-validator';

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
  @IsIn(['activo', 'inactivo', 'suspendido'])
  readonly estado?: string;
}