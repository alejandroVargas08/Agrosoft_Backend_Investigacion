import { Inject, Injectable } from '@nestjs/common';
import { Epa } from '../../../domain/entities/epa.entity';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EPA_REPOSITORY_TOKEN } from '../../../domain/ports/epa.repository.token';

@Injectable()
export class ListarEpasUseCase {
  constructor(
    @Inject(EPA_REPOSITORY_TOKEN)
    private readonly epaRepository: EpaRepositoryPort,
  ) {}

  async execute(): Promise<Epa[]> {
    return this.epaRepository.listarTodos();
  }
}