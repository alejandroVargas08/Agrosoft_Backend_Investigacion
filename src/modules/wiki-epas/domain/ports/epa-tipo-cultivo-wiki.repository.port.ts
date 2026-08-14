import { EpaTipoCultivoWiki } from '../entities/epa-tipo-cultivo-wiki.entity';

export interface EpaTipoCultivoWikiRepositoryPort {
  asociar(relacion: EpaTipoCultivoWiki): Promise<EpaTipoCultivoWiki>;
  desasociar(epaId: number, tipoCultivoWikiId: number): Promise<void>;
  existeRelacion(epaId: number, tipoCultivoWikiId: number): Promise<boolean>;
  listarTiposCultivoPorEpa(epaId: number): Promise<EpaTipoCultivoWiki[]>;
  listarEpasPorTipoCultivo(tipoCultivoWikiId: number): Promise<EpaTipoCultivoWiki[]>;
}