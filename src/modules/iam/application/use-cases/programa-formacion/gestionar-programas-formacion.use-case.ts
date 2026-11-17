import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../domain/ports/programa-formacion.repository.token';
import type { UsuarioProgramaRepositoryPort } from '../../../domain/ports/usuario-programa.repository.port';
import { USUARIO_PROGRAMA_REPOSITORY } from '../../../domain/ports/usuario-programa.repository.token';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import type { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { ROL_REPOSITORY } from '../../../domain/ports/rol.repository.token';
import type { AlcanceDatos } from '../../../domain/value-objects/alcance-datos.vo';
import { CrearProgramaFormacionDto } from '../../dto/programa-formacion/crear-programa-formacion.dto';
import { ActualizarProgramaFormacionDto } from '../../dto/programa-formacion/actualizar-programa-formacion.dto';
import { aProgramaRespuesta, ProgramaFormacionRespuesta } from '../../dto/programa-formacion/programa-formacion.respuesta';

export interface PersonaFicha {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

export interface ProgramaConResumen extends ProgramaFormacionRespuesta {
  instructores: PersonaFicha[];
  totalAprendices: number;
}

@Injectable()
export class GestionarProgramasFormacionUseCase {
  constructor(
    @Inject(PROGRAMA_FORMACION_REPOSITORY)
    private readonly repo: ProgramaFormacionRepositoryPort,
    @Inject(USUARIO_PROGRAMA_REPOSITORY)
    private readonly usuarioProgramas: UsuarioProgramaRepositoryPort,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarios: UsuarioRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly roles: RolRepositoryPort,
  ) {}

  async listarActivos(): Promise<ProgramaFormacionRespuesta[]> {
    const programas = await this.repo.obtenerTodos();
    return programas.filter((programa) => programa.obtenerEstado() === 'activo').map(aProgramaRespuesta);
  }

  async listarTodos(): Promise<ProgramaFormacionRespuesta[]> {
    const programas = await this.repo.obtenerTodos();
    return programas.map(aProgramaRespuesta);
  }

  async listarAsignables(alcance: AlcanceDatos): Promise<ProgramaFormacionRespuesta[]> {
    const programas = await this.repo.obtenerTodos();
    return programas
      .filter((programa) => alcance.verTodo || alcance.programasPermitidos.includes(programa.obtenerId()))
      .map(aProgramaRespuesta);
  }

  async resumen(): Promise<ProgramaConResumen[]> {
    const [programas, usuarios, asignaciones, rolAprendiz] = await Promise.all([
      this.repo.obtenerTodos(),
      this.usuarios.obtenerTodos(),
      this.usuarioProgramas.listarTodas(),
      this.roles.buscarPorNombre('Aprendiz'),
    ]);
    const activos = usuarios.filter((u) => u.estaActivo());
    const porId = new Map(activos.map((u) => [u.obtenerId(), u]));

    return programas.map((programa) => {
      const id = programa.obtenerId();
      const instructores = asignaciones
        .filter((a) => a.programaFormacionId === id)
        .map((a) => porId.get(a.usuarioId))
        .filter((u): u is NonNullable<typeof u> => u !== undefined)
        .map((u) => ({ id: u.obtenerId(), nombre: u.obtenerNombre(), apellido: u.obtenerApellido(), correo: u.obtenerCorreo() }));
      const totalAprendices = activos.filter(
        (u) => u.obtenerProgramaFormacionId() === id && (!rolAprendiz || u.obtenerRolId() === rolAprendiz.obtenerId()),
      ).length;
      return { ...aProgramaRespuesta(programa), instructores, totalAprendices };
    });
  }

  async crear(dto: CrearProgramaFormacionDto): Promise<ProgramaFormacionRespuesta> {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);
    if (fechaFin < fechaInicio) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
    if (await this.repo.buscarPorFicha(dto.ficha.trim())) {
      throw new ConflictException(`Ya existe la ficha ${dto.ficha}`);
    }
    const programa = await this.repo.guardar({
      nombre: dto.nombre.trim(),
      tipo: dto.tipo.trim(),
      ficha: dto.ficha.trim(),
      fechaInicio,
      fechaFin,
      estado: dto.estado ?? 'activo',
    });
    return aProgramaRespuesta(programa);
  }

  async actualizar(id: number, dto: ActualizarProgramaFormacionDto): Promise<ProgramaFormacionRespuesta> {
    const programa = await this.repo.buscarPorId(id);
    if (!programa) throw new NotFoundException(`No existe el programa de formación ${id}`);

    const ficha = dto.ficha?.trim();
    if (ficha && ficha !== programa.obtenerFicha()) {
      const otro = await this.repo.buscarPorFicha(ficha);
      if (otro && otro.obtenerId() !== id) throw new ConflictException(`Ya existe la ficha ${ficha}`);
    }

    try {
      programa.actualizar({
        nombre: dto.nombre?.trim(),
        tipo: dto.tipo?.trim(),
        ficha,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
        estado: dto.estado,
      });
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    return aProgramaRespuesta(await this.repo.actualizar(programa));
  }
}
