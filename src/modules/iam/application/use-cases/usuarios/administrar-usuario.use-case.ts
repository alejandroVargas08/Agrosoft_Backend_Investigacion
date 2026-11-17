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
import { CrearUsuarioAdminDto } from '../../dto/usuarios/administrar-usuario.dto';
import { AccesoAprendicesService } from '../../services/acceso-aprendices.service';

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
    private readonly accesoAprendices: AccesoAprendicesService,
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

  async aprobarRegistro(usuarioId: number, fichasElegidas?: number[]): Promise<UsuarioPublico> {
    const usuario = await this.obtenerUsuario(usuarioId);
    if (!usuario.estaPendiente()) throw new ConflictException('Este usuario no tiene una solicitud pendiente');

    // Las que eligio el administrador mandan sobre las que se pidieron
    const fichas = fichasElegidas ?? usuario.obtenerSolicitudRegistro()?.fichasACargo ?? [];
    for (const programaId of fichasElegidas ?? []) {
      if (!(await this.programaRepository.buscarPorId(programaId))) {
        throw new NotFoundException(`Ficha con ID ${programaId} no encontrada`);
      }
    }

    usuario.aprobarRegistro();
    const actualizado = await this.usuarioRepository.actualizar(usuario);
    for (const programaId of fichas) {
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
    // La regla de "quien es aprendiz de este alcance" vive en el servicio, que
    // tambien usa el resumen del instructor y el modulo de novedades
    const aprendices = await this.accesoAprendices.listar(alcance, programaFormacionId);
    return aprendices.map((usuario) => ({
      id: usuario.obtenerId(),
      nombre: usuario.obtenerNombre(),
      apellido: usuario.obtenerApellido(),
      correo: usuario.obtenerCorreo(),
      programaFormacionId: usuario.obtenerProgramaFormacionId(),
    }));
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

  /**
   * Da de alta un usuario sin pasar por el registro publico: queda activo y
   * con el rol que el administrador elija. La contrasena se genera aqui y se
   * devuelve una sola vez, igual que al restablecerla, porque no se manda
   * correo y el administrador tiene que poder entregarsela.
   */
  async crearComoAdmin(
    dto: CrearUsuarioAdminDto,
  ): Promise<{ usuario: UsuarioPublico; contrasenaTemporal: string }> {
    const correo = dto.correo.trim().toLowerCase();
    if (await this.usuarioRepository.buscarPorCorreo(correo)) {
      throw new ConflictException('Ya hay un usuario registrado con ese correo');
    }

    if (!(await this.rolRepository.buscarPorId(dto.rolId))) {
      throw new NotFoundException(`Rol con ID ${dto.rolId} no encontrado`);
    }

    if (dto.programaFormacionId !== undefined) {
      if (!(await this.programaRepository.buscarPorId(dto.programaFormacionId))) {
        throw new NotFoundException(`Ficha con ID ${dto.programaFormacionId} no encontrada`);
      }
    }

    const contrasenaTemporal = this.generarContrasena();
    const usuario = Usuario.crear({
      id: 0,
      nombre: dto.nombre,
      apellido: dto.apellido,
      identificacion: dto.identificacion,
      telefono: dto.telefono ?? '',
      correo,
      contrasenaHash: await bcrypt.hash(contrasenaTemporal, await bcrypt.genSalt(10)),
      rolId: dto.rolId,
      programaFormacionId: dto.programaFormacionId,
      estado: 'activo',
    });

    const creado = await this.usuarioRepository.guardar(usuario);
    return { usuario: aUsuarioPublico(creado), contrasenaTemporal };
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
