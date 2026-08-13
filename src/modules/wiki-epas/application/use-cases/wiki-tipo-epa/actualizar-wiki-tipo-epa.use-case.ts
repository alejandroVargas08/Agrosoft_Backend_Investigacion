import { Inject, Injectable } from '@nestjs/common';
import { WikiTipoEpa } from '../../../domain/entities/wiki-tipo-epa.entity';
import type { WikiTipoEpaRepositoryPort } from '../../../domain/ports/wiki-tipo-epa.repository.port';
import { WIKI_TIPO_EPA_REPOSITORY_TOKEN } from '../../../domain/ports/wiki-tipo-epa.repository.token';
import { ActualizarWikiTipoEpaDto } from '../../dto/wiki-tipo-epa/actualizar-wiki-tipo-epa.dto';
import { ObtenerWikiTipoEpaUseCase } from './obtener-wiki-tipo-epa.use-case';

@Injectable()
export class ActualizarWikiTipoEpaUseCase {
  constructor(
    @Inject(WIKI_TIPO_EPA_REPOSITORY_TOKEN)
    private readonly wikiTipoEpaRepository: WikiTipoEpaRepositoryPort,
    private readonly obtenerWikiTipoEpaUseCase: ObtenerWikiTipoEpaUseCase,
  ) {}

  async execute(id: number, dto: ActualizarWikiTipoEpaDto): Promise<WikiTipoEpa> {
    const actual = await this.obtenerWikiTipoEpaUseCase.execute(id);
    actual.actualizarDatos(dto);
    return this.wikiTipoEpaRepository.actualizar(id, actual);
  }
}