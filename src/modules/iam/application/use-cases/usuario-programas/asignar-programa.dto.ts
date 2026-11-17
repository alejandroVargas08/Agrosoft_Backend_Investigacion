import { IsInt, IsPositive } from 'class-validator';

export class AsignarProgramaDto {
  @IsInt()
  @IsPositive()
  readonly programaFormacionId: number;
}
