import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { formatoDia, visibleLote } from './formato';

const ESTADO: Record<string, string> = { open: 'abierta', in_treatment: 'en tratamiento', resolved: 'resuelta' };
const SEVERIDAD: Record<string, string> = { low: 'baja', medium: 'media', high: 'alta' };

@Injectable()
export class ProveedorContextoIncidencias implements ProveedorContextoPort {
  readonly fuente = 'incidencias' as const;

  constructor(private readonly ds: DataSource) {}

  async obtener(usuario: UsuarioAutenticado): Promise<string> {
    const filas: {
      titulo: string;
      tipo: string;
      severidad: string;
      estado: string;
      fecha: Date | string;
      descripcion: string | null;
      cultivo: string | null;
      lote: string | null;
    }[] = await this.ds.query(
      `SELECT i.titulo, i.tipo, i.severidad, i.estado, i.fecha, i.descripcion,
              c."nombreCultivo" AS cultivo, l.nombre AS lote
       FROM incidencias i
       LEFT JOIN cultivos c ON c.id = i.cultivo_id
       LEFT JOIN lotes l ON l.id = c.lote_id
       WHERE i.deleted_at IS NULL
         AND (l.id IS NULL OR (l.deleted_at IS NULL AND ${visibleLote('l', 1, 2)}))
       ORDER BY CASE i.estado WHEN 'open' THEN 0 WHEN 'in_treatment' THEN 1 ELSE 2 END, i.fecha DESC
       LIMIT 12`,
      [usuario.verTodo, usuario.programasPermitidos],
    );

    if (filas.length === 0) return 'INCIDENCIAS: no hay incidencias registradas.';

    const abiertas = filas.filter((f) => f.estado !== 'resolved').length;
    const lineas = filas.map((f) => {
      const partes = [
        `- ${f.titulo} (${f.tipo})`,
        `severidad ${SEVERIDAD[f.severidad] ?? f.severidad}`,
        ESTADO[f.estado] ?? f.estado,
        formatoDia(f.fecha),
      ];
      if (f.cultivo) partes.push(`cultivo ${f.cultivo}${f.lote ? ` en ${f.lote}` : ''}`);
      if (f.descripcion) partes.push(f.descripcion.slice(0, 160));
      return partes.join(' | ');
    });

    return [`INCIDENCIAS (${abiertas} sin resolver entre las más recientes):`, ...lineas].join('\n');
  }
}
