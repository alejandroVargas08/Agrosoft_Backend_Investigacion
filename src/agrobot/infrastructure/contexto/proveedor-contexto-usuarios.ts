import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { formatoDia } from './formato';

@Injectable()
export class ProveedorContextoUsuarios implements ProveedorContextoPort {
  readonly fuente = 'usuarios' as const;

  constructor(private readonly ds: DataSource) {}

  async obtener(): Promise<string> {
    const [porRol, pendientes, total] = await Promise.all([
      this.ds.query(
        `SELECT r.nombre AS rol, COUNT(*)::int AS total
         FROM usuarios u
         JOIN roles r ON r.id = u.rol_id
         WHERE u.eliminado_en IS NULL AND u.estado = 'activo'
         GROUP BY r.nombre
         ORDER BY r.nombre`,
      ) as Promise<{ rol: string; total: number }[]>,
      this.ds.query(
        `SELECT u.nombre, u.apellido, u.solicitud_registro->>'rolSolicitado' AS rol, u.creado_en
         FROM usuarios u
         WHERE u.eliminado_en IS NULL AND u.estado = 'pendiente'
         ORDER BY u.creado_en ASC
         LIMIT 10`,
      ) as Promise<{ nombre: string; apellido: string | null; rol: string | null; creado_en: Date }[]>,
      this.ds.query(
        `SELECT COUNT(*)::int AS total FROM usuarios WHERE eliminado_en IS NULL AND estado = 'pendiente'`,
      ) as Promise<{ total: number }[]>,
    ]);

    const lineas = [
      'USUARIOS:',
      `Activos por rol: ${porRol.map((r) => `${r.rol} ${r.total}`).join(', ') || 'ninguno'}.`,
      `Solicitudes de registro esperando aprobación: ${total[0]?.total ?? 0}.`,
      ...pendientes.map(
        (p) => `- ${[p.nombre, p.apellido].filter(Boolean).join(' ')} | pide rol ${p.rol ?? 'sin dato'} | desde ${formatoDia(p.creado_en)}`,
      ),
    ];
    return lineas.join('\n');
  }
}
