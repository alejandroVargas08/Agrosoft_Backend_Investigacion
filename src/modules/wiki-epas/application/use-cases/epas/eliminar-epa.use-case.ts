import { Inject, Injectable } from '@nestjs/common';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EPA_REPOSITORY_TOKEN } from '../../../domain/ports/epa.repository.token';
import { ObtenerEpaUseCase } from './obtener-epa.use-case';

@Injectable()
export class EliminarEpaUseCase {
  constructor(
    @Inject(EPA_REPOSITORY_TOKEN)
    private readonly epaRepository: EpaRepositoryPort,
    private readonly obtenerEpaUseCase: ObtenerEpaUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerEpaUseCase.execute(id);
    await this.epaRepository.eliminar(id);
  }
}