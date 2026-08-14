import { IsString, MinLength } from 'class-validator';

export class CrearTipoCultivoWikiDto {
  @IsString() @MinLength(2)
  nombre: string;

  @IsString()
  descripcion: string;
}