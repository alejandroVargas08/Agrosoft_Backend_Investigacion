import { Inject, Injectable } from '@nestjs/common';
import { EpaTipoCultivoWiki } from '../../../domain/entities/epa-tipo-cultivo-wiki.entity';
import type { EpaTipoCultivoWikiRepositoryPort } from '../../../domain/ports/epa-tipo-cultivo-wiki.repository.port';
import { EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/epa-tipo-cultivo-wiki.repository.token';

@Injectable()
export class ListarTiposCultivoPorEpaUseCase {
  constructor(
    @Inject(EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly repository: EpaTipoCultivoWikiRepositoryPort,
  ) {}

  async execute(epaId: number): Promise<EpaTipoCultivoWiki[]> {
    return this.repository.listarTiposCultivoPorEpa(epaId);
  }
}