import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../domain/ports/programa-formacion.repository.token';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import type { UsuarioProgramaRepositoryPort } from '../../../domain/ports/usuario-programa.repository.port';
import { USUARIO_PROGRAMA_REPOSITORY } from '../../../domain/ports/usuario-programa.repository.token';

@Injectable()
export class GestionarProgramasACargoUseCase {
  constructor(
    @Inject(USUARIO_PROGRAMA_REPOSITORY)
    private readonly usuarioProgramas: UsuarioProgramaRepositoryPort,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarios: UsuarioRepositoryPort,
    @Inject(PROGRAMA_FORMACION_REPOSITORY)
    private readonly programas: ProgramaFormacionRepositoryPort,
  ) {}

  async listar(usuarioId: number): Promise<number[]> {
    await this.verificarUsuario(usuarioId);
    return this.usuarioProgramas.listarProgramasDeUsuario(usuarioId);
  }

  async asignar(usuarioId: number, programaFormacionId: number): Promise<number[]> {
    await this.verificarUsuario(usuarioId);
    const programa = await this.programas.buscarPorId(programaFormacionId);
    if (!programa) throw new NotFoundException(`No existe el programa de formación ${programaFormacionId}`);
    if (await this.usuarioProgramas.existe(usuarioId, programaFormacionId)) {
      throw new ConflictException('El usuario ya tiene a cargo ese programa de formación');
    }
    await this.usuarioProgramas.asignar(usuarioId, programaFormacionId);
    return this.usuarioProgramas.listarProgramasDeUsuario(usuarioId);
  }

  async quitar(usuarioId: number, programaFormacionId: number): Promise<number[]> {
    await this.verificarUsuario(usuarioId);
    await this.usuarioProgramas.quitar(usuarioId, programaFormacionId);
    return this.usuarioProgramas.listarProgramasDeUsuario(usuarioId);
  }

  private async verificarUsuario(usuarioId: number): Promise<void> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new NotFoundException(`No existe el usuario ${usuarioId}`);
  }
}
