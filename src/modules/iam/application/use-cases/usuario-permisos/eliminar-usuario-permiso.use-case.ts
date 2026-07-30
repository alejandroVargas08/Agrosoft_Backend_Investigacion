import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioPermisoRepositoryPort } from '../../../domain/ports/usuario-permiso.repository.port.js';
import { USUARIO_PERMISO_REPOSITORY } from '../../../domain/ports/usuario-permiso.repository.token.js';

@Injectable()
export class EliminarUsuarioPermisoUseCase {
  constructor(
    @Inject(USUARIO_PERMISO_REPOSITORY)
    private readonly usuarioPermisoRepository: UsuarioPermisoRepositoryPort,
  ) {}

  async ejecutar(usuarioId: number, permisoId: number): Promise<void> {
    const existente = await this.usuarioPermisoRepository.buscarPorUsuarioYPermiso(
      usuarioId,
      permisoId,
    );
    if (!existente) {
      throw new NotFoundException('La relación usuario-permiso no existe');
    }

    await this.usuarioPermisoRepository.eliminarPorUsuarioYPermiso(usuarioId, permisoId);
  }
}