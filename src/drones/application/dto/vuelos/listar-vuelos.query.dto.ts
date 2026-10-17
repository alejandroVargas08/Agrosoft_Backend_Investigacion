import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class ListarVuelosQueryDto {
  @IsOptional() @Type(() => Number) @IsInt()
  loteId?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  dronId?: number;
}
