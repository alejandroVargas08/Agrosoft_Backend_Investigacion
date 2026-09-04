import { Injectable, Inject } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
  ) {}

  async ejecutar(): Promise<Usuario[]> {
    return await this.usuarioRepository.obtenerTodos();
  }
}