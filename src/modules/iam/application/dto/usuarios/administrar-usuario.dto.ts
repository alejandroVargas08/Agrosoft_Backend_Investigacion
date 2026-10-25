import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

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
