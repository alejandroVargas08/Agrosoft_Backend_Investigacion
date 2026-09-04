import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TipoCultivoWiki } from '../../../domain/entities/tipo-cultivo-wiki.entity';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-cultivo-wiki.repository.token';

@Injectable()
export class ObtenerTipoCultivoWikiUseCase {
  constructor(
    @Inject(TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly tipoCultivoWikiRepository: TipoCultivoWikiRepositoryPort,
  ) {}

  async execute(id: number): Promise<TipoCultivoWiki> {
    const tipoCultivo = await this.tipoCultivoWikiRepository.buscarPorId(id);
    if (!tipoCultivo) throw new NotFoundException(`No existe un tipo de cultivo con id ${id}`);
    return tipoCultivo;
  }
}