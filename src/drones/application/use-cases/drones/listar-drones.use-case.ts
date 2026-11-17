import { Inject, Injectable } from '@nestjs/common';
import { Dron } from '../../../domain/entities/dron.entity';
import type { DronRepositoryPort } from '../../../domain/ports/dron.repository.port';
import { DRON_REPOSITORY_TOKEN } from '../../../domain/ports/dron.repository.token';

@Injectable()
export class ListarDronesUseCase {
  constructor(
    @Inject(DRON_REPOSITORY_TOKEN)
    private readonly dronRepository: DronRepositoryPort,
  ) {}

  async execute(): Promise<Dron[]> {
    return this.dronRepository.listarTodos();
  }
}
