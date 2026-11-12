import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

    if (dto.nombre) {
      usuarioExistente.cambiarNombre(dto.nombre);
    }

    if (dto.apellido) {
      usuarioExistente.cambiarApellido(dto.apellido);
    }

    if (dto.correo && dto.correo !== usuarioExistente.obtenerCorreo()) {
      // Sin esto el correo repetido choca con el indice unico y sale un 500
      const otro = await this.usuarioRepository.buscarPorCorreo(dto.correo);
      if (otro && otro.obtenerId() !== id) {
        throw new ConflictException('Ese correo ya está registrado en otra cuenta');
      }
      usuarioExistente.cambiarCorreo(dto.correo);
    }

    if (dto.telefono) {
      usuarioExistente.cambiarTelefono(dto.telefono);
    }

    // Se compara contra undefined a proposito: false es un valor valido y con
    // un if normal nunca se podria apagar.
    if (dto.dosPasosActivo !== undefined) {
      usuarioExistente.cambiarDosPasos(dto.dosPasosActivo);
    }

    if (dto.estado) {
      if (dto.estado === 'activo') usuarioExistente.activar();
      if (dto.estado === 'inactivo') usuarioExistente.desactivar();
      if (dto.estado === 'suspendido') usuarioExistente.suspender();
    }

    return await this.usuarioRepository.actualizar(usuarioExistente);
  }
}