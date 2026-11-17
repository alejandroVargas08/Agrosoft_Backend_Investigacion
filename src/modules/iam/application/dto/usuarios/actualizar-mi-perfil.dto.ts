import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class ActualizarMiPerfilDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  readonly nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  readonly apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s]*$/, { message: 'El teléfono solo puede tener números' })
  readonly telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  readonly ubicacion?: string;
}