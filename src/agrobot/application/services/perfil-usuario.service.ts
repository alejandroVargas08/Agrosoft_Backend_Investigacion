import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';

export interface PerfilChat {
  nombre: string;
  rol: string;
}

@Injectable()
export class PerfilUsuarioService {
  constructor(private readonly ds: DataSource) {}

  async describir(usuario: UsuarioAutenticado): Promise<PerfilChat> {
    const filas: { nombre: string; apellido: string | null; rol: string | null }[] = await this.ds.query(
      `SELECT u.nombre, u.apellido, r.nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON r.id = u.rol_id
       WHERE u.id = $1`,
      [usuario.id],
    );
    const fila = filas[0];
    return {
      nombre: fila ? [fila.nombre, fila.apellido].filter(Boolean).join(' ') : usuario.correo,
      rol: fila?.rol ?? 'sin rol',
    };
  }
}
