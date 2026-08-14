import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { Usuario } from '../../../domain/entities/usuario.entity';

@Injectable()
export class ObtenerUsuarioUseCase {
  constructor(
    @Inject('USUARIO_REPOSITORY') 
    private readonly usuarioRepository: UsuarioRepositoryPort,
  ) {}

  async ejecutar(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    
    return usuario;
  }
}