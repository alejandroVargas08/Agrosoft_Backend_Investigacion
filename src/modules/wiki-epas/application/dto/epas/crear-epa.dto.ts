import { IsString, IsInt, IsIn, IsArray, IsOptional, MinLength, Min, Max } from 'class-validator';

export class CrearEpaDto {
  @IsString() @MinLength(2)
  nombre: string;

  @IsIn(['ENFERMEDAD', 'PLAGA', 'ARVENSE'])
  tipoEpa: 'ENFERMEDAD' | 'PLAGA' | 'ARVENSE';

  @IsString()
  descripcion: string;

  @IsString()
  sintomas: string;

  @IsString()
  manejoYControl: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  mesesProbables: number[];

  @IsArray()
  @IsString({ each: true })
  temporadas: string[];

  @IsOptional() @IsString()
  notasEstacionalidad?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  fotosSintomas?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  fotosGenerales?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  etiquetas?: string[];

  @IsInt()
  creadoPorUsuarioId: number;
}