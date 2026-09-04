import { Inject, Injectable } from '@nestjs/common';
import { TipoCultivoWiki } from '../../../domain/entities/tipo-cultivo-wiki.entity';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-cultivo-wiki.repository.token';
import { CrearTipoCultivoWikiDto } from '../../dto/tipos-cultivos-wiki/crear-tipo-cultivo-wiki.dto';

@Injectable()
export class CrearTipoCultivoWikiUseCase {
  constructor(
    @Inject(TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly tipoCultivoWikiRepository: TipoCultivoWikiRepositoryPort,
  ) {}

  async execute(dto: CrearTipoCultivoWikiDto): Promise<TipoCultivoWiki> {
    const tipoCultivo = TipoCultivoWiki.crear({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });

    return this.tipoCultivoWikiRepository.guardar(tipoCultivo);
  }
}