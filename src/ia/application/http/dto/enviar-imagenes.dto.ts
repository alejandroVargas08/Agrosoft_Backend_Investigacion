import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class EnviarImagenesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  readonly imagenes: string[];

  @IsString()
  readonly prompt: string;
}