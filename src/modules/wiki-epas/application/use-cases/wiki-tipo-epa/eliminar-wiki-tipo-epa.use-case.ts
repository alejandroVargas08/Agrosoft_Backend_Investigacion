import { Inject, Injectable } from '@nestjs/common';
import type { WikiTipoEpaRepositoryPort } from '../../../domain/ports/wiki-tipo-epa.repository.port';
import { WIKI_TIPO_EPA_REPOSITORY_TOKEN } from '../../../domain/ports/wiki-tipo-epa.repository.token';
import { ObtenerWikiTipoEpaUseCase } from './obtener-wiki-tipo-epa.use-case';

@Injectable()
export class EliminarWikiTipoEpaUseCase {
  constructor(
    @Inject(WIKI_TIPO_EPA_REPOSITORY_TOKEN)
    private readonly wikiTipoEpaRepository: WikiTipoEpaRepositoryPort,
    private readonly obtenerWikiTipoEpaUseCase: ObtenerWikiTipoEpaUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerWikiTipoEpaUseCase.execute(id);
    await this.wikiTipoEpaRepository.eliminar(id);
  }
}