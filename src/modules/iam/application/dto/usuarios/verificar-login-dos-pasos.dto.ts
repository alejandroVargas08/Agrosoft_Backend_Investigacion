import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerificarLoginDosPasosDto {
  @IsEmail()
  readonly correo: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código tiene 6 dígitos' })
  readonly codigo: string;
}
