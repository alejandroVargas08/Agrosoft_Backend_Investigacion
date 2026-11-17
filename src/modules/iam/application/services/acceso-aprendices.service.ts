import { Inject, Injectable } from '@nestjs/common';
import type { AlcanceDatos } from '../../domain/value-objects/alcance-datos.vo';
import { Usuario } from '../../domain/entities/usuario.entity';
import type { RolRepositoryPort } from '../../domain/ports/rol.repository.port';
import { ROL_REPOSITORY } from '../../domain/ports/rol.repository.token';
import type { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../domain/ports/usuario.repository.token';

const ROL_APRENDIZ = 'Aprendiz';

/**
 * Responde una sola pregunta: qué aprendices entran en el alcance de quien
 * pregunta. Antes estaba escrito en dos sitios (el listado de aprendices y el
 * resumen del instructor) y cualquier cambio había que hacerlo dos veces.
 *
 * La regla: tiene el rol Aprendiz, está activo, tiene programa de formación,
 * y ese programa está dentro del alcance.
 */
@Injectable()
export class AccesoAprendicesService {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepositoryPort,
    @Inject(ROL_REPOSITORY) private readonly roles: RolRepositoryPort,
  ) {}

  async listar(alcance: AlcanceDatos, programaFormacionId?: number): Promise<Usuario[]> {
    const rol = await this.roles.buscarPorNombre(ROL_APRENDIZ);
    if (!rol) return [];

    const todos = await this.usuarios.obtenerTodos();
    return todos
      .filter((usuario) => usuario.estaActivo() && usuario.obtenerRolId() === rol.obtenerId())
      .filter((usuario) => {
        const programa = usuario.obtenerProgramaFormacionId();
        if (programa === null) return false;
        if (programaFormacionId !== undefined && programa !== programaFormacionId) return false;
        return alcance.verTodo || alcance.programasPermitidos.includes(programa);
      })
      .sort((a, b) =>
        `${a.obtenerApellido()} ${a.obtenerNombre()}`.localeCompare(
          `${b.obtenerApellido()} ${b.obtenerNombre()}`,
          'es',
        ),
      );
  }

  async idsVisibles(alcance: AlcanceDatos, programaFormacionId?: number): Promise<number[]> {
    return (await this.listar(alcance, programaFormacionId)).map((usuario) => usuario.obtenerId());
  }

  /** Si ese aprendiz es de los que puede ver quien pregunta. */
  async puedeVer(alcance: AlcanceDatos, aprendizId: number): Promise<boolean> {
    return (await this.idsVisibles(alcance)).includes(aprendizId);
  }
}
