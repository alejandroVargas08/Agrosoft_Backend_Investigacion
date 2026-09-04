import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WikiTipoEpa } from '../../../domain/entities/wiki-tipo-epa.entity';
import type { WikiTipoEpaRepositoryPort } from '../../../domain/ports/wiki-tipo-epa.repository.port';
import { WIKI_TIPO_EPA_REPOSITORY_TOKEN } from '../../../domain/ports/wiki-tipo-epa.repository.token';

@Injectable()
export class ObtenerWikiTipoEpaUseCase {
  constructor(
    @Inject(WIKI_TIPO_EPA_REPOSITORY_TOKEN)
    private readonly wikiTipoEpaRepository: WikiTipoEpaRepositoryPort,
  ) {}

  async execute(id: number): Promise<WikiTipoEpa> {
    const tipoEpa = await this.wikiTipoEpaRepository.buscarPorId(id);
    if (!tipoEpa) throw new NotFoundException(`No existe un tipo de EPA con id ${id}`);
    return tipoEpa;
  }
}