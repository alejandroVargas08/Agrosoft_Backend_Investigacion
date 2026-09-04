import { Inject, Injectable } from '@nestjs/common';
import type { RolPermisoRepositoryPort } from '../../../domain/ports/rol-permiso.repository.port';
import { ROL_PERMISO_REPOSITORY } from '../../../domain/ports/rol-permiso.repository.token';
import { RolPermiso } from '../../../domain/entities/rol-permiso.entity';

@Injectable()
export class ListarPermisosPorRolUseCase {
  constructor(
    @Inject(ROL_PERMISO_REPOSITORY)
    private readonly repository: RolPermisoRepositoryPort,
  ) {}

  async ejecutar(rolId: number): Promise<RolPermiso[]> {
    return await this.repository.buscarPorRolId(rolId);
  }
}