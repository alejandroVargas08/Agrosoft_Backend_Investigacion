import { IsInt } from 'class-validator';

export class AsociarEpaTipoCultivoWikiDto {
  @IsInt()
  epaId: number;

  @IsInt()
  tipoCultivoWikiId: number;
}