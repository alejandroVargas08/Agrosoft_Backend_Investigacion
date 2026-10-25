import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import type { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { ROL_REPOSITORY } from '../../../domain/ports/rol.repository.token';
import type { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../domain/ports/programa-formacion.repository.token';
import type { UsuarioProgramaRepositoryPort } from '../../../domain/ports/usuario-programa.repository.port';
import { USUARIO_PROGRAMA_REPOSITORY } from '../../../domain/ports/usuario-programa.repository.token';
import { Usuario } from '../../../domain/entities/usuario.entity';
import type { AlcanceDatos } from '../../../domain/value-objects/alcance-datos.vo';
import { aUsuarioPublico, UsuarioPublico } from '../../dto/usuarios/usuario-respuesta.mapper';

export interface AprendizResumen {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  programaFormacionId: number | null;
}

@Injectable()
export class AdministrarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
    @Inject(PROGRAMA_FORMACION_REPOSITORY)
    private readonly programaRepository: ProgramaFormacionRepositoryPort,
    @Inject(USUARIO_PROGRAMA_REPOSITORY)
    private readonly usuarioProgramas: UsuarioProgramaRepositoryPort,
  ) {}

  async listarSolicitudes(): Promise<UsuarioPublico[]> {
    const usuarios = await this.usuarioRepository.obtenerTodos();
    return usuarios
      .filter((usuario) => usuario.estaPendiente() && usuario.obtenerEliminadoEn() === null)
      .sort((a, b) => a.obtenerCreadoEn().getTime() - b.obtenerCreadoEn().getTime())
      .map(aUsuarioPublico);
  }

  async aprobarRegistro(usuarioId: number): Promise<UsuarioPublico> {
    const usuario = await this.obtenerUsuario(usuarioId);
    if (!usuario.estaPendiente()) throw new ConflictException('Este usuario no tiene una solicitud pendiente');
    usuario.aprobarRegistro();
    const actualizado = await this.usuarioRepository.actualizar(usuario);
    for (const programaId of usuario.obtenerSolicitudRegistro()?.fichasACargo ?? []) {
      if (!(await this.usuarioProgramas.existe(usuarioId, programaId))) {
        await this.usuarioProgramas.asignar(usuarioId, programaId);
      }
    }
    return aUsuarioPublico(actualizado);
  }

  async rechazarRegistro(usuarioId: number, motivo: string): Promise<UsuarioPublico> {
    const usuario = await this.obtenerUsuario(usuarioId);
    if (!usuario.estaPendiente()) throw new ConflictException('Este usuario no tiene una solicitud pendiente');
    usuario.rechazarRegistro(motivo.trim());
    return aUsuarioPublico(await this.usuarioRepository.actualizar(usuario));
  }

  async listar(): Promise<UsuarioPublico[]> {
    const usuarios = await this.usuarioRepository.obtenerTodos();
    return usuarios.map(aUsuarioPublico);
  }

  async listarAprendices(alcance: AlcanceDatos, programaFormacionId?: number): Promise<AprendizResumen[]> {
    const rol = await this.rolRepository.buscarPorNombre('Aprendiz');
    if (!rol) return [];
    const usuarios = await this.usuarioRepository.obtenerTodos();
    return usuarios
      .filter((usuario) => usuario.estaActivo() && usuario.obtenerRolId() === rol.obtenerId())
      .filter((usuario) => {
        const programa = usuario.obtenerProgramaFormacionId();
        if (programa === null) return false;
        if (programaFormacionId !== undefined && programa !== programaFormacionId) return false;
        return alcance.verTodo || alcance.programasPermitidos.includes(programa);
      })
      .map((usuario) => ({
        id: usuario.obtenerId(),
        nombre: usuario.obtenerNombre(),
        apellido: usuario.obtenerApellido(),
        correo: usuario.obtenerCorreo(),
        programaFormacionId: usuario.obtenerProgramaFormacionId(),
      }))
      .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'));
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

  async restablecerContrasena(usuarioId: number, nuevaContrasena?: string): Promise<{ usuarioId: number; contrasenaTemporal: string | null }> {
    const usuario = await this.obtenerUsuario(usuarioId);
    const generada = nuevaContrasena ? null : this.generarContrasena();
    const hash = await bcrypt.hash(nuevaContrasena ?? generada!, await bcrypt.genSalt(10));
    usuario.cambiarContrasena(hash);
    await this.usuarioRepository.actualizar(usuario);
    return { usuarioId, contrasenaTemporal: generada };
  }

  private generarContrasena(): string {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let texto = '';
    for (let i = 0; i < 10; i++) texto += caracteres[randomInt(caracteres.length)];
    return texto;
  }

  private async obtenerUsuario(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }
}
