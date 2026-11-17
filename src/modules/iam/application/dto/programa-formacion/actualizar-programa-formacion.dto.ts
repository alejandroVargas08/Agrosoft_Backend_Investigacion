import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarProgramaFormacionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  readonly nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly tipo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly ficha?: string;

  @IsOptional()
  @IsDateString()
  readonly fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  readonly fechaFin?: string;

  @IsOptional()
  @IsIn(['activo', 'inactivo', 'finalizado'])
  readonly estado?: string;
}
