import { Entity, PrimaryColumn } from 'typeorm';

@Entity('epa_tipos_cultivos_wiki')
export class EpaTipoCultivoWikiOrmEntity {
  @PrimaryColumn({ name: 'epa_id' })
  epaId: number;

  @PrimaryColumn({ name: 'tipo_cultivo_wiki_id' })
  tipoCultivoWikiId: number;
}