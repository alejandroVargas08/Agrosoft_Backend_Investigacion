import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginRostroDto {
  @IsEmail()
  correo: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(300000, { each: true })
  imagenes: string[];
}