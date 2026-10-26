import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  identificacion: string;

  @IsString()
  @IsOptional()
  idFicha?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  programaFormacionId?: number;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  @IsOptional()
  rolId?: number;

  /** Nombre del rol que pide el usuario al registrarse. Cualquiera distinto
   *  del rol por defecto deja la cuenta pendiente de aprobación. */
  @IsString()
  @IsOptional()
  rolSolicitado?: string;
}
