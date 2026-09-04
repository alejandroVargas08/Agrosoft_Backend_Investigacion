import { IsString, IsIn, MinLength } from 'class-validator';

export class CrearWikiTipoEpaDto {
  @IsString() @MinLength(2)
  nombre: string;

  @IsString()
  descripcion: string;

  @IsIn(['ENFERMEDAD', 'PLAGA', 'ARVENSE'])
  tipoEpaEnum: 'ENFERMEDAD' | 'PLAGA' | 'ARVENSE';
}