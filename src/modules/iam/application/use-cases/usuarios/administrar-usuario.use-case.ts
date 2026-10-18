import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import type { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { ROL_REPOSITORY } from '../../../domain/ports/rol.repository.token';
import type { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../domain/ports/programa-formacion.repository.token';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { aUsuarioPublico, UsuarioPublico } from '../../dto/usuarios/usuario-respuesta.mapper';

@Injectable()
export class AdministrarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
    @Inject(PROGRAMA_FORMACION_REPOSITORY)
    private readonly programaRepository: ProgramaFormacionRepositoryPort,
  ) {}

  async listar(): Promise<UsuarioPublico[]> {
    const usuarios = await this.usuarioRepository.obtenerTodos();
    return usuarios.map(aUsuarioPublico);
  }

  async cambiarRol(usuarioId: number, rolId: number): Promise<UsuarioPublico> {
    const usuario = await this.obtenerUsuario(usuarioId);
    const rol = await this.rolRepository.buscarPorId(rolId);
    if (!rol) throw new BadRequestException(`El rol ${rolId} no existe`);
    usuario.asignarRol(rolId);
    return aUsuarioPublico(await this.usuarioRepository.actualizar(usuario));
  }

  async cambiarPrograma(usuarioId: number, programaFormacionId: number | null): Promise<UsuarioPublico> {
    const usuario = await this.obtenerUsuario(usuarioId);
    if (programaFormacionId !== null) {
      const programa = await this.programaRepository.buscarPorId(programaFormacionId);
      if (!programa) throw new BadRequestException(`El programa de formación ${programaFormacionId} no existe`);
    }
    usuario.asignarProgramaFormacion(programaFormacionId);
    return aUsuarioPublico(await this.usuarioRepository.actualizar(usuario));
  }

  private async obtenerUsuario(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }
}
