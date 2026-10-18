import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearProgramaFormacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly tipo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly ficha: string;

  @IsDateString()
  readonly fechaInicio: string;

  @IsDateString()
  readonly fechaFin: string;

  @IsOptional()
  @IsIn(['activo', 'inactivo', 'finalizado'])
  readonly estado?: string;
}
