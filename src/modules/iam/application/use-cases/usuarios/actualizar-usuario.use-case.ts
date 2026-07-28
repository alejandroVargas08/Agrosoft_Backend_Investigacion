import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import { ActualizarUsuarioDto } from '../../dto/usuarios/actualizar-usuario.dto';
import { Usuario } from '../../../domain/entities/usuario.entity';

@Injectable()
export class ActualizarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
  ) {}

  async ejecutar(id: number, dto: ActualizarUsuarioDto): Promise<Usuario> {
    const usuarioExistente = await this.usuarioRepository.buscarPorId(id);
    if (!usuarioExistente) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (dto.correo) {
      usuarioExistente.cambiarCorreo(dto.correo);
    }

    if (dto.telefono) {
      usuarioExistente.cambiarTelefono(dto.telefono);
    }

    if (dto.estado) {
      if (dto.estado === 'activo') usuarioExistente.activar();
      if (dto.estado === 'inactivo') usuarioExistente.desactivar();
      if (dto.estado === 'suspendido') usuarioExistente.suspender();
    }

    return await this.usuarioRepository.actualizar(usuarioExistente);
  }
}