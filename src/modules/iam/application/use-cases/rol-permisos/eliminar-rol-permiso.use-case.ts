import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { RolPermisoRepositoryPort } from '../../../domain/ports/rol-permiso.repository.port';
import { ROL_PERMISO_REPOSITORY } from '../../../domain/ports/rol-permiso.repository.token';

@Injectable()
export class EliminarRolPermisoUseCase {
  constructor(
    @Inject(ROL_PERMISO_REPOSITORY)
    private readonly repository: RolPermisoRepositoryPort,
  ) {}

  async ejecutar(rolId: number, permisoId: number): Promise<void> {
    const existente = await this.repository.buscarPorRolYPermiso(rolId, permisoId);
    if (!existente) 
        throw new NotFoundException('La relación rol-permiso no existe');
            await this.repository.eliminar(rolId, permisoId);

  }
}