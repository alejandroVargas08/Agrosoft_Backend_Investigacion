import { Inject, Injectable } from '@nestjs/common';
import { Vuelo } from '../../../domain/entities/vuelo.entity';
import type { FiltrosVuelo, VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';

@Injectable()
export class ListarVuelosUseCase {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
  ) {}

  async execute(filtros: FiltrosVuelo = {}): Promise<Vuelo[]> {
    return this.vueloRepository.listar(filtros);
  }
}
