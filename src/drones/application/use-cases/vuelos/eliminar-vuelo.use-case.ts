import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';
import { ObtenerVueloUseCase } from './obtener-vuelo.use-case';

@Injectable()
export class EliminarVueloUseCase {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    private readonly obtenerVueloUseCase: ObtenerVueloUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    const vuelo = await this.obtenerVueloUseCase.execute(id);
    if (vuelo.estado === 'ANALIZANDO') {
      throw new ConflictException('No se puede eliminar un vuelo mientras se está analizando');
    }
    await this.vueloRepository.eliminar(id);
  }
}
