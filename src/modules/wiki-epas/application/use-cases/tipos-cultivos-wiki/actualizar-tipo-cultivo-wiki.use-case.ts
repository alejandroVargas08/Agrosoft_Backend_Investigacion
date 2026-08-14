import { Inject, Injectable } from '@nestjs/common';
import { TipoCultivoWiki } from '../../../domain/entities/tipo-cultivo-wiki.entity';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-cultivo-wiki.repository.token';
import { ActualizarTipoCultivoWikiDto } from '../../dto/tipos-cultivos-wiki/actualizar-tipo-cultivo-wiki.dto';
import { ObtenerTipoCultivoWikiUseCase } from './obtener-tipo-cultivo-wiki.use-case';

@Injectable()
export class ActualizarTipoCultivoWikiUseCase {
  constructor(
    @Inject(TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly tipoCultivoWikiRepository: TipoCultivoWikiRepositoryPort,
    private readonly obtenerTipoCultivoWikiUseCase: ObtenerTipoCultivoWikiUseCase,
  ) {}

  async execute(id: number, dto: ActualizarTipoCultivoWikiDto): Promise<TipoCultivoWiki> {
    const actual = await this.obtenerTipoCultivoWikiUseCase.execute(id);
    actual.actualizarDatos(dto);
    return this.tipoCultivoWikiRepository.actualizar(id, actual);
  }
}