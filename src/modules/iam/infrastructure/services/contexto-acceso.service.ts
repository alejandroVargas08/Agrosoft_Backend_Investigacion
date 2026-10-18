import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ContextoAccesoPort } from '../../domain/ports/contexto-acceso.port';
import { PERMISO_VER_TODAS_LAS_FICHAS, UsuarioAutenticado } from '../../domain/value-objects/alcance-datos.vo';
import { UsuarioOrmEntity } from '../persistence/entities/usuario.orm-entity';
import { UsuarioProgramaOrmEntity } from '../persistence/entities/usuario-programa.orm-entity';

const CONSULTA_PERMISOS = `
  SELECT DISTINCT p.nombre
  FROM permisos p
  WHERE p.eliminado_en IS NULL
    AND p.estado = 'activo'
    AND (
      p.id IN (
        SELECT rp.permiso_id
        FROM rol_permisos rp
        JOIN roles r ON r.id = rp.rol_id
        WHERE rp.rol_id = $1
          AND rp.eliminado_en IS NULL
          AND r.eliminado_en IS NULL
          AND r.estado = 'activo'
      )
      OR p.id IN (
        SELECT up.permiso_id
        FROM permisos_de_usuarios up
        WHERE up.usuario_id = $2
          AND up.eliminado_en IS NULL
      )
    )
`;

@Injectable()
export class ContextoAccesoService implements ContextoAccesoPort {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly usuarios: Repository<UsuarioOrmEntity>,
    @InjectRepository(UsuarioProgramaOrmEntity)
    private readonly usuarioProgramas: Repository<UsuarioProgramaOrmEntity>,
  ) {}

  async obtener(usuarioId: number): Promise<UsuarioAutenticado | null> {
    const usuario = await this.usuarios.findOne({ where: { id: usuarioId } });
    if (!usuario || usuario.estado !== 'activo') return null;

    const [filasPermisos, programasACargo] = await Promise.all([
      this.usuarios.query(CONSULTA_PERMISOS, [usuario.rolId, usuario.id]) as Promise<{ nombre: string }[]>,
      this.usuarioProgramas.find({ where: { usuarioId: usuario.id } }),
    ]);

    const permisos = filasPermisos.map((fila) => fila.nombre);
    const programas = new Set<number>(programasACargo.map((fila) => fila.programaFormacionId));
    if (usuario.programaFormacionId !== null) programas.add(usuario.programaFormacionId);

    return {
      id: usuario.id,
      correo: usuario.correo,
      rolId: usuario.rolId,
      permisos,
      verTodo: permisos.includes(PERMISO_VER_TODAS_LAS_FICHAS),
      programasPermitidos: [...programas],
    };
  }
}
