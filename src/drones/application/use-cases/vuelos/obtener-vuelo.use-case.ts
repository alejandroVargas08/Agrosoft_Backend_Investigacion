import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AlcanceDatos } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { ACCESO_LOTES_PORT } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import type { AccesoLotesPort } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import { Vuelo } from '../../../domain/entities/vuelo.entity';
import type { VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';

@Injectable()
export class ObtenerVueloUseCase {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    @Inject(ACCESO_LOTES_PORT)
    private readonly accesoLotes: AccesoLotesPort,
  ) {}

  async execute(id: number, alcance: AlcanceDatos): Promise<Vuelo> {
    const vuelo = await this.vueloRepository.buscarPorId(id);
    if (!vuelo || !(await this.accesoLotes.puedeAcceder(alcance, vuelo.loteId))) {
      throw new NotFoundException(`No existe un vuelo con id ${id}`);
    }
    return vuelo;
  }
}
