import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EpaTipoCultivoWiki } from '../../../domain/entities/epa-tipo-cultivo-wiki.entity';
import type { EpaTipoCultivoWikiRepositoryPort } from '../../../domain/ports/epa-tipo-cultivo-wiki.repository.port';
import { EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/epa-tipo-cultivo-wiki.repository.token';
import { AsociarEpaTipoCultivoWikiDto } from '../../dto/epa-tipos-cultivos-wiki/asociar-epa-tipo-cultivo-wiki.dto';
import { ObtenerEpaUseCase } from '../epas/obtener-epa.use-case';
import { ObtenerTipoCultivoWikiUseCase } from '../tipos-cultivos-wiki/obtener-tipo-cultivo-wiki.use-case';

@Injectable()
export class AsociarEpaTipoCultivoWikiUseCase {
  constructor(
    @Inject(EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly repository: EpaTipoCultivoWikiRepositoryPort,
    private readonly obtenerEpaUseCase: ObtenerEpaUseCase,
    private readonly obtenerTipoCultivoWikiUseCase: ObtenerTipoCultivoWikiUseCase,
  ) {}

  async execute(dto: AsociarEpaTipoCultivoWikiDto): Promise<EpaTipoCultivoWiki> {
    // 1. Verificamos que ambos lados de la relación existan de verdad
    await this.obtenerEpaUseCase.execute(dto.epaId);
    await this.obtenerTipoCultivoWikiUseCase.execute(dto.tipoCultivoWikiId);

    // 2. Evitamos duplicar la misma asociación dos veces
    const yaExiste = await this.repository.existeRelacion(dto.epaId, dto.tipoCultivoWikiId);
    if (yaExiste) {
      throw new BadRequestException('Esta EPA ya está asociada a este tipo de cultivo');
    }

    const relacion = EpaTipoCultivoWiki.crear({
      epaId: dto.epaId,
      tipoCultivoWikiId: dto.tipoCultivoWikiId,
    });

    return this.repository.asociar(relacion);
  }
}