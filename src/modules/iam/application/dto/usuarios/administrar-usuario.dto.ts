import { IsInt, IsOptional, IsPositive } from 'class-validator';

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
