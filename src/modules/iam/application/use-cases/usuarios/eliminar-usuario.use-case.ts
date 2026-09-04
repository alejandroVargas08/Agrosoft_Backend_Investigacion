import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';

@Injectable()
export class EliminarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
  ) {}

  async ejecutar(id: number): Promise<void> {
    const usuarioExistente = await this.usuarioRepository.buscarPorId(id);
    if (!usuarioExistente) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    usuarioExistente.eliminar();
    await this.usuarioRepository.actualizar(usuarioExistente);
  }
}