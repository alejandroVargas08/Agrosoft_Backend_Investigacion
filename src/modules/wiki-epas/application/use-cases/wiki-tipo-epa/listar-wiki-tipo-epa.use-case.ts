import { Inject, Injectable } from '@nestjs/common';
import { WikiTipoEpa } from '../../../domain/entities/wiki-tipo-epa.entity';
import type { WikiTipoEpaRepositoryPort } from '../../../domain/ports/wiki-tipo-epa.repository.port';
import { WIKI_TIPO_EPA_REPOSITORY_TOKEN } from '../../../domain/ports/wiki-tipo-epa.repository.token';

@Injectable()
export class ListarWikiTipoEpaUseCase {
  constructor(
    @Inject(WIKI_TIPO_EPA_REPOSITORY_TOKEN)
    private readonly wikiTipoEpaRepository: WikiTipoEpaRepositoryPort,
  ) {}

  async execute(): Promise<WikiTipoEpa[]> {
    return this.wikiTipoEpaRepository.listarTodos();
  }
}