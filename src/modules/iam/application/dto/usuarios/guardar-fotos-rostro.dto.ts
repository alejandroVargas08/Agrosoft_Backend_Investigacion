import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, MaxLength } from 'class-validator';

export class GuardarFotosRostroDto {
  @IsArray()
  @ArrayMinSize(20)
  @ArrayMaxSize(60)
  @IsString({ each: true })
  @MaxLength(300000, { each: true })
  fotos: string[];
}