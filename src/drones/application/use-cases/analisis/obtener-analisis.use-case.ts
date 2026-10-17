import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AnalisisVuelo } from '../../../domain/entities/analisis-vuelo.entity';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/analisis-vuelo.repository.token';

@Injectable()
export class ObtenerAnalisisUseCase {
  constructor(
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN)
    private readonly analisisRepository: AnalisisVueloRepositoryPort,
  ) {}

  async execute(id: number): Promise<AnalisisVuelo> {
    const analisis = await this.analisisRepository.buscarPorId(id);
    if (!analisis) throw new NotFoundException(`No existe un análisis con id ${id}`);
    return analisis;
  }
}
