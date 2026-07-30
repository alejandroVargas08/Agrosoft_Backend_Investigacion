import { IsInt, IsNotEmpty } from 'class-validator';

export class AsignarRolPermisoDto {
  @IsInt()
  @IsNotEmpty()
  readonly rolId: number;

  @IsInt()
  @IsNotEmpty()
  readonly permisoId: number;
}