import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { EpaTipoCultivoWikiRepositoryPort } from '../../../domain/ports/epa-tipo-cultivo-wiki.repository.port';
import { EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/epa-tipo-cultivo-wiki.repository.token';

@Injectable()
export class DesasociarEpaTipoCultivoWikiUseCase {
  constructor(
    @Inject(EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly repository: EpaTipoCultivoWikiRepositoryPort,
  ) {}

  async execute(epaId: number, tipoCultivoWikiId: number): Promise<void> {
    const existe = await this.repository.existeRelacion(epaId, tipoCultivoWikiId);
    if (!existe) {
      throw new NotFoundException('Esta EPA no está asociada a este tipo de cultivo');
    }
    await this.repository.desasociar(epaId, tipoCultivoWikiId);
  }
}