import { IsInt, IsNotEmpty } from 'class-validator';

export class AsignarUsuarioPermisoDto {
  @IsInt()
  @IsNotEmpty() 
  readonly usuarioId: number;
  @IsInt() 
  @IsNotEmpty() 
  readonly permisoId: number;
}