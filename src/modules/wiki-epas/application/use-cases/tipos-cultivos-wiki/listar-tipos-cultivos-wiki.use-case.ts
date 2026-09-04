import { Inject, Injectable } from '@nestjs/common';
import { TipoCultivoWiki } from '../../../domain/entities/tipo-cultivo-wiki.entity';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-cultivo-wiki.repository.token';

@Injectable()
export class ListarTiposCultivosWikiUseCase {
  constructor(
    @Inject(TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly tipoCultivoWikiRepository: TipoCultivoWikiRepositoryPort,
  ) {}

  async execute(): Promise<TipoCultivoWiki[]> {
    return this.tipoCultivoWikiRepository.listarTodos();
  }
}