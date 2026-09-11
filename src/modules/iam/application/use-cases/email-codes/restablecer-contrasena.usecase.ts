import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import * as bcrypt from 'bcrypt';

interface RestablecerContrasenaRequest {
  correo: string;
  token: string;
  nuevaContrasena: string;
}

@Injectable()
export class RestablecerContrasenaUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
  ) {}

  async ejecutar(request: RestablecerContrasenaRequest): Promise<void> {
    const usuario = await this.usuarioRepository.buscarPorCorreo(request.correo);
    
    if (!usuario) {
      throw new NotFoundException('No se encontró un usuario con este correo');
    }

    const saltRounds = 10;
    const nuevoHash = await bcrypt.hash(request.nuevaContrasena, saltRounds);

    usuario.cambiarContrasena(nuevoHash);

    await this.usuarioRepository.guardar(usuario);
  }
}