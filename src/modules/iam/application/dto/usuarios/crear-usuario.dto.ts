import { ArrayMaxSize, IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export const TIPOS_USUARIO_REGISTRO = ['aprendiz', 'instructor', 'administrador'] as const;
export type TipoUsuarioRegistro = (typeof TIPOS_USUARIO_REGISTRO)[number];

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

  @IsOptional()
  @IsIn(TIPOS_USUARIO_REGISTRO)
  tipoUsuario?: TipoUsuarioRegistro;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  codigoInstructor?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  fichasACargo?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cargo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivoSolicitud?: string;
}
