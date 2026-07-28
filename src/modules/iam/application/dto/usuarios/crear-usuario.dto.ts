import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CrearUsuarioDto{
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}