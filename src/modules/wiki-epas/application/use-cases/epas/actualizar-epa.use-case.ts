import { Inject, Injectable } from '@nestjs/common';
import { Epa } from '../../../domain/entities/epa.entity';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EPA_REPOSITORY_TOKEN } from '../../../domain/ports/epa.repository.token';
import { ActualizarEpaDto } from '../../dto/epas/actualizar-epa.dto';
import { ObtenerEpaUseCase } from './obtener-epa.use-case';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-cultivo-wiki.repository.token';
import { resolverCultivosSusceptibles } from './resolver-cultivos-susceptibles';

@Injectable()
export class ActualizarEpaUseCase {
  constructor(
    @Inject(EPA_REPOSITORY_TOKEN)
    private readonly epaRepository: EpaRepositoryPort,
    private readonly obtenerEpaUseCase: ObtenerEpaUseCase,
    @Inject(TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly tiposCultivo: TipoCultivoWikiRepositoryPort,
  ) {}

  async execute(id: number, dto: ActualizarEpaDto): Promise<Epa> {
    const actual = await this.obtenerEpaUseCase.execute(id);
    const { cultivosSusceptiblesIds, ...cambios } = dto;
    actual.actualizarDatos(cambios);
    if (cultivosSusceptiblesIds) {
      actual.cambiarCultivosSusceptibles(await resolverCultivosSusceptibles(cultivosSusceptiblesIds, this.tiposCultivo));
    }
    return this.epaRepository.actualizar(id, actual);
  }
}