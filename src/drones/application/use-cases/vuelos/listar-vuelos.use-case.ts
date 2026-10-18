import { Inject, Injectable } from '@nestjs/common';
import type { AlcanceDatos } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { ACCESO_LOTES_PORT } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import type { AccesoLotesPort } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import { Vuelo } from '../../../domain/entities/vuelo.entity';
import type { FiltrosVuelo, VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';

@Injectable()
export class ListarVuelosUseCase {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    @Inject(ACCESO_LOTES_PORT)
    private readonly accesoLotes: AccesoLotesPort,
  ) {}

  async execute(filtros: Omit<FiltrosVuelo, 'loteIds'>, alcance: AlcanceDatos): Promise<Vuelo[]> {
    const loteIds = await this.accesoLotes.idsAccesibles(alcance);
    if (loteIds === null) return this.vueloRepository.listar(filtros);
    if (filtros.loteId !== undefined && !loteIds.includes(filtros.loteId)) return [];
    return this.vueloRepository.listar({ ...filtros, loteIds });
  }
}
