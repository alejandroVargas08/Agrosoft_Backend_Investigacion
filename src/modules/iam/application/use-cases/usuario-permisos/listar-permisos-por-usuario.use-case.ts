import { Inject, Injectable } from '@nestjs/common';
import type { UsuarioPermisoRepositoryPort } from '../../../domain/ports/usuario-permiso.repository.port';
import { USUARIO_PERMISO_REPOSITORY } from '../../../domain/ports/usuario-permiso.repository.token';
import { UsuarioPermiso } from '../../../domain/entities/usuario-permiso.entity';

@Injectable()
export class ListarPermisosPorUsuarioUseCase {
  constructor(
    @Inject(USUARIO_PERMISO_REPOSITORY)
    private readonly repository: UsuarioPermisoRepositoryPort,
  ) {}

  async ejecutar(usuarioId: number): Promise<UsuarioPermiso[]> {
    return await this.repository.buscarPorUsuarioId(usuarioId);
  }
}