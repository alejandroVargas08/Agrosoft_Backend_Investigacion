import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PermisoRepositoryPort } from '../../../domain/ports/permiso.repository.port';
import { PERMISO_REPOSITORY } from '../../../domain/ports/permiso.repository.token';

@Injectable()
export class EliminarPermisoUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY)
    private readonly permisoRepository: PermisoRepositoryPort,
  ) {}

  async ejecutar(id: number): Promise<void> {
    const permiso = await this.permisoRepository.buscarPorId(id);
    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    permiso.eliminar();
    await this.permisoRepository.actualizar(permiso);
  }
}