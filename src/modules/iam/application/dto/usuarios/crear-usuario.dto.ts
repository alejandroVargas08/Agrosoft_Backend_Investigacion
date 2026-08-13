import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  identificacion: string;

  @IsString()
  @IsOptional()
  idFicha?: string;

  @IsNumber()
  @IsOptional()
  programaFormacionId?: number;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  rolId: number;
}