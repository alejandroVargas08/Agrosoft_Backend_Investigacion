import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  readonly correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}