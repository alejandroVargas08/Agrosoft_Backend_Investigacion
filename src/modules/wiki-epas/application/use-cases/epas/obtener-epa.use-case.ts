import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Epa } from '../../../domain/entities/epa.entity';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EPA_REPOSITORY_TOKEN } from '../../../domain/ports/epa.repository.token';

@Injectable()
export class ObtenerEpaUseCase {
  constructor(
    @Inject(EPA_REPOSITORY_TOKEN)
    private readonly epaRepository: EpaRepositoryPort,
  ) {}

  async execute(id: number): Promise<Epa> {
    const epa = await this.epaRepository.buscarPorId(id);
    if (!epa) throw new NotFoundException(`No existe una EPA con id ${id}`);
    return epa;
  }
}