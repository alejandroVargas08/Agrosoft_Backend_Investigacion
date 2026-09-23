import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class AnalizarImagenDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  readonly imagenes: string[];

  @IsString()
  readonly prompt: string;
}