import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { PuntoDto } from '../../../modules/territorio/infrastructure/http/dto/punto.dto';

export class SolicitarEvaluacionDto {
  @IsOptional() @IsInt()
  loteId?: number;

  @IsOptional() @IsArray() @ArrayMinSize(3) @ArrayMaxSize(200)
  @ValidateNested({ each: true }) @Type(() => PuntoDto)
  poligono?: PuntoDto[];

  @IsOptional() @IsString() @MaxLength(120)
  nombre?: string;

  @IsOptional() @IsString() @MaxLength(40)
  cultivoPreferido?: string;

  @IsOptional() @IsBoolean()
  usarDron?: boolean;

  @IsOptional() @IsBoolean()
  usarSatelite?: boolean;
}
