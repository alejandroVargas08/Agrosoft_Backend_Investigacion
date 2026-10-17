import { Inject, Injectable } from '@nestjs/common';
import type { DronRepositoryPort } from '../../../domain/ports/dron.repository.port';
import { DRON_REPOSITORY_TOKEN } from '../../../domain/ports/dron.repository.token';
import { ObtenerDronUseCase } from './obtener-dron.use-case';

@Injectable()
export class EliminarDronUseCase {
  constructor(
    @Inject(DRON_REPOSITORY_TOKEN)
    private readonly dronRepository: DronRepositoryPort,
    private readonly obtenerDronUseCase: ObtenerDronUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerDronUseCase.execute(id);
    await this.dronRepository.eliminar(id);
  }
}
