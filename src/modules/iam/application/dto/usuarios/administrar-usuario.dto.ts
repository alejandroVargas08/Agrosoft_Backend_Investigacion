import { ArrayUnique, IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Al aprobar a un instructor, el administrador puede ajustar las fichas que
 * le quedan a cargo. Sin la lista se asignan las que pidio al registrarse.
 */
export class AprobarRegistroDto {
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  readonly fichasACargo?: number[];
}

/**
 * El alta que hace el administrador desde Gestion de Usuarios, distinta del
 * registro publico: aqui se elige el rol y el usuario queda activo de una,
 * sin pasar por la cola de solicitudes.
 */
export class CrearUsuarioAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly apellido: string;

  @IsEmail()
  readonly correo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  readonly identificacion: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  readonly telefono?: string;

  @IsInt()
  @IsPositive()
  readonly rolId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly programaFormacionId?: number;
}

export class CambiarRolUsuarioDto {
  @IsInt()
  @IsPositive()
  readonly rolId: number;
}

export class CambiarProgramaUsuarioDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly programaFormacionId: number | null;
}

export class RechazarRegistroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  readonly motivo: string;
}

export class RestablecerContrasenaAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  readonly nuevaContrasena?: string;
}
