import { EpaTipoCultivoWiki } from '../../../domain/entities/epa-tipo-cultivo-wiki.entity';
import { EpaTipoCultivoWikiOrmEntity } from '../entities/epa-tipo-cultivo-wiki.orm-entity';

export class EpaTipoCultivoWikiMapper {
  static toDomain(orm: EpaTipoCultivoWikiOrmEntity): EpaTipoCultivoWiki {
    return EpaTipoCultivoWiki.desdePersistencia({
      epaId: orm.epaId,
      tipoCultivoWikiId: orm.tipoCultivoWikiId,
    });
  }

  static toOrm(relacion: EpaTipoCultivoWiki): EpaTipoCultivoWikiOrmEntity {
    const orm = new EpaTipoCultivoWikiOrmEntity();
    orm.epaId = relacion.epaId;
    orm.tipoCultivoWikiId = relacion.tipoCultivoWikiId;
    return orm;
  }
}