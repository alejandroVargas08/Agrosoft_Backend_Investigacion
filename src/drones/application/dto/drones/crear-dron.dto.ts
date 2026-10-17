import { IsString, IsInt, IsIn, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CrearDronDto {
  @IsString() @MinLength(3)
  nombre: string;

  @IsString()
  modelo: string;

  @IsOptional() @IsString()
  numeroSerie?: string;

  @IsIn(['RGB', 'MULTIESPECTRAL'])
  tipoCamara: 'RGB' | 'MULTIESPECTRAL';

  @IsOptional() @IsBoolean()
  tieneRtk?: boolean;

  @IsInt()
  creadoPorUsuarioId: number;
}
