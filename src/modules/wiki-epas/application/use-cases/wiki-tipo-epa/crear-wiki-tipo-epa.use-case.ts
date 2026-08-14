import { Inject, Injectable } from '@nestjs/common';
import { WikiTipoEpa } from '../../../domain/entities/wiki-tipo-epa.entity';
import type { WikiTipoEpaRepositoryPort } from '../../../domain/ports/wiki-tipo-epa.repository.port';
import { WIKI_TIPO_EPA_REPOSITORY_TOKEN } from '../../../domain/ports/wiki-tipo-epa.repository.token';
import { CrearWikiTipoEpaDto } from '../../dto/wiki-tipo-epa/crear-wiki-tipo-epa.dto';

@Injectable()
export class CrearWikiTipoEpaUseCase {
  constructor(
    @Inject(WIKI_TIPO_EPA_REPOSITORY_TOKEN)
    private readonly wikiTipoEpaRepository: WikiTipoEpaRepositoryPort,
  ) {}

  async execute(dto: CrearWikiTipoEpaDto): Promise<WikiTipoEpa> {
    const tipoEpa = WikiTipoEpa.crear({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      tipoEpaEnum: dto.tipoEpaEnum,
    });

    return this.wikiTipoEpaRepository.guardar(tipoEpa);
  }
}