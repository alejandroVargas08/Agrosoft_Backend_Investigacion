import { Inject, Injectable } from '@nestjs/common';
import { Permiso } from '../../../domain/entities/permiso.entity';
import type { PermisoRepositoryPort } from '../../../domain/ports/permiso.repository.port';
import { PERMISO_REPOSITORY } from '../../../domain/ports/permiso.repository.token';

@Injectable()
export class ListarPermisosUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY)
    private readonly permisoRepository: PermisoRepositoryPort,
  ) {}

  async ejecutar(): Promise<Permiso[]> {
    return await this.permisoRepository.listarTodos();
  }
}