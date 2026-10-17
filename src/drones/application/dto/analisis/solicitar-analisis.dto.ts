import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SolicitarAnalisisDto {
  @IsOptional() @IsNumber() @Min(-1) @Max(1)
  umbralSinVegetacion?: number;

  @IsOptional() @IsNumber() @Min(-1) @Max(1)
  umbralEstresAlto?: number;

  @IsOptional() @IsNumber() @Min(-1) @Max(1)
  umbralSaludable?: number;

  @IsOptional() @IsNumber() @Min(1) @Max(100)
  porcentajeCritico?: number;

  @IsInt()
  solicitadoPorUsuarioId: number;
}
