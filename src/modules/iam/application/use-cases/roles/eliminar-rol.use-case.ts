import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { ROL_REPOSITORY } from '../../../domain/ports/rol.repository.token';

@Injectable()
export class EliminarRolUseCase {
  constructor(
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
  ) {}

  async ejecutar(id: number): Promise<void> {
    const rol = await this.rolRepository.buscarPorId(id);
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    rol.eliminar();
    await this.rolRepository.actualizar(rol);
  }
}