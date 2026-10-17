import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Vuelo } from '../../../domain/entities/vuelo.entity';
import type { VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';

@Injectable()
export class ObtenerVueloUseCase {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
  ) {}

  async execute(id: number): Promise<Vuelo> {
    const vuelo = await this.vueloRepository.buscarPorId(id);
    if (!vuelo) throw new NotFoundException(`No existe un vuelo con id ${id}`);
    return vuelo;
  }
}
