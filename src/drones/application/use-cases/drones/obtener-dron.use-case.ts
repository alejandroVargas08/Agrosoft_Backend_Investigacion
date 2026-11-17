import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Dron } from '../../../domain/entities/dron.entity';
import type { DronRepositoryPort } from '../../../domain/ports/dron.repository.port';
import { DRON_REPOSITORY_TOKEN } from '../../../domain/ports/dron.repository.token';

@Injectable()
export class ObtenerDronUseCase {
  constructor(
    @Inject(DRON_REPOSITORY_TOKEN)
    private readonly dronRepository: DronRepositoryPort,
  ) {}

  async execute(id: number): Promise<Dron> {
    const dron = await this.dronRepository.buscarPorId(id);
    if (!dron) throw new NotFoundException(`No existe un dron con id ${id}`);
    return dron;
  }
}
