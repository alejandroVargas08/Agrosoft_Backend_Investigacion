import { Inject, Injectable } from '@nestjs/common';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-cultivo-wiki.repository.token';
import { ObtenerTipoCultivoWikiUseCase } from './obtener-tipo-cultivo-wiki.use-case';

@Injectable()
export class EliminarTipoCultivoWikiUseCase {
  constructor(
    @Inject(TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly tipoCultivoWikiRepository: TipoCultivoWikiRepositoryPort,
    private readonly obtenerTipoCultivoWikiUseCase: ObtenerTipoCultivoWikiUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerTipoCultivoWikiUseCase.execute(id);
    await this.tipoCultivoWikiRepository.eliminar(id);
  }
}