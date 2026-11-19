import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { formatoDia, formatoFecha, numero, visibleLote } from './formato';

const ESTADO_TAREA: Record<string, string> = {
  ASIGNADA: 'asignada sin iniciar',
  EN_PROGRESO: 'en progreso',
  ENTREGADA: 'entregada, esperando revisión',
  APROBADA: 'aprobada',
  DEVUELTA: 'devuelta para corregir',
};

const PERMISOS_GESTION = ['actividades.revisar', 'actividades.asignar', 'actividades.gestionar'];

const BASE_GESTION = `
  FROM actividad_asignaciones aa
  JOIN actividades a ON a.id = aa.actividad_id AND a.deleted_at IS NULL
  JOIN lotes l ON l.id = a.lote_id AND l.deleted_at IS NULL
  WHERE aa.eliminado_en IS NULL AND ${visibleLote('l', 1, 2)}`;

@Injectable()
export class ProveedorContextoTareas implements ProveedorContextoPort {
  readonly fuente = 'tareas' as const;

  constructor(private readonly ds: DataSource) {}

  async obtener(usuario: UsuarioAutenticado): Promise<string> {
    const bloques: string[] = [];

    const propias = await this.propias(usuario.id);
    if (propias) bloques.push(propias);

    if (PERMISOS_GESTION.some((permiso) => usuario.permisos.includes(permiso))) {
      bloques.push(await this.gestion(usuario));
    }

    return bloques.length > 0 ? bloques.join('\n\n') : 'TAREAS: el usuario no tiene tareas asignadas.';
  }

  private async propias(usuarioId: number): Promise<string | null> {
    const conteo: { estado: string; total: number }[] = await this.ds.query(
      `SELECT aa.estado, COUNT(*)::int AS total
       FROM actividad_asignaciones aa
       JOIN actividades a ON a.id = aa.actividad_id AND a.deleted_at IS NULL
       JOIN lotes l ON l.id = a.lote_id AND l.deleted_at IS NULL
       WHERE aa.aprendiz_id = $1 AND aa.eliminado_en IS NULL
       GROUP BY aa.estado`,
      [usuarioId],
    );
    if (conteo.length === 0) return null;

    const filas: {
      actividad: string;
      tipo: string;
      lote: string;
      estado: string;
      fecha_limite: Date | string | null;
      vencida: boolean;
      horas_trabajadas: number | null;
      comentario_instructor: string | null;
    }[] = await this.ds.query(
      `SELECT a.nombre AS actividad, a.tipo, l.nombre AS lote, aa.estado, aa.fecha_limite,
              (aa.fecha_limite < CURRENT_DATE AND aa.estado IN ('ASIGNADA', 'EN_PROGRESO', 'DEVUELTA')) AS vencida,
              aa.horas_trabajadas, aa.comentario_instructor
       FROM actividad_asignaciones aa
       JOIN actividades a ON a.id = aa.actividad_id AND a.deleted_at IS NULL
       JOIN lotes l ON l.id = a.lote_id AND l.deleted_at IS NULL
       WHERE aa.aprendiz_id = $1 AND aa.eliminado_en IS NULL
       ORDER BY CASE aa.estado WHEN 'DEVUELTA' THEN 0 WHEN 'EN_PROGRESO' THEN 1 WHEN 'ASIGNADA' THEN 2 WHEN 'ENTREGADA' THEN 3 ELSE 4 END,
                aa.fecha_limite ASC NULLS LAST
       LIMIT 20`,
      [usuarioId],
    );

    const resumen = conteo.map((c) => `${ESTADO_TAREA[c.estado] ?? c.estado}: ${c.total}`).join(', ');
    const lineas = filas.map((f) => {
      const partes = [
        `- ${f.actividad} (${f.tipo})`,
        f.lote,
        ESTADO_TAREA[f.estado] ?? f.estado,
        f.fecha_limite ? `vence ${formatoDia(f.fecha_limite)}${f.vencida ? ' (VENCIDA)' : ''}` : 'sin fecha límite',
      ];
      if (f.horas_trabajadas !== null) partes.push(`horas reportadas ${numero(f.horas_trabajadas)}`);
      if (f.comentario_instructor) partes.push(`comentario del instructor: "${f.comentario_instructor}"`);
      return partes.join(' | ');
    });

    return [`MIS TAREAS (${resumen}):`, ...lineas].join('\n');
  }

  private async gestion(usuario: UsuarioAutenticado): Promise<string> {
    const alcance = [usuario.verTodo, usuario.programasPermitidos];

    const [conteo, porRevisar, vencidas, proximas, actividades, aprendices] = await Promise.all([
      this.ds.query(`SELECT aa.estado, COUNT(*)::int AS total ${BASE_GESTION} GROUP BY aa.estado`, alcance) as Promise<
        { estado: string; total: number }[]
      >,
      this.ds.query(
        `SELECT a.nombre AS actividad, u.nombre, u.apellido, aa.entregada_en, aa.horas_trabajadas
         ${BASE_GESTION.replace('WHERE', 'JOIN usuarios u ON u.id = aa.aprendiz_id WHERE')}
         AND aa.estado = 'ENTREGADA'
         ORDER BY aa.entregada_en ASC NULLS LAST
         LIMIT 10`,
        alcance,
      ) as Promise<{ actividad: string; nombre: string; apellido: string | null; entregada_en: Date | null; horas_trabajadas: number | null }[]>,
      this.ds.query(
        `SELECT a.nombre AS actividad, u.nombre, u.apellido, aa.fecha_limite, aa.estado
         ${BASE_GESTION.replace('WHERE', 'JOIN usuarios u ON u.id = aa.aprendiz_id WHERE')}
         AND aa.estado IN ('ASIGNADA', 'EN_PROGRESO', 'DEVUELTA') AND aa.fecha_limite < CURRENT_DATE
         ORDER BY aa.fecha_limite ASC
         LIMIT 10`,
        alcance,
      ) as Promise<{ actividad: string; nombre: string; apellido: string | null; fecha_limite: Date | string; estado: string }[]>,
      this.ds.query(
        `SELECT a.nombre AS actividad, COUNT(*)::int AS aprendices, MIN(aa.fecha_limite) AS fecha
         ${BASE_GESTION}
         AND aa.estado IN ('ASIGNADA', 'EN_PROGRESO', 'DEVUELTA')
         AND aa.fecha_limite BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
         GROUP BY a.nombre
         ORDER BY fecha ASC
         LIMIT 8`,
        alcance,
      ) as Promise<{ actividad: string; aprendices: number; fecha: Date | string }[]>,
      this.ds.query(
        `SELECT a.estado, COUNT(*)::int AS total
         FROM actividades a
         JOIN lotes l ON l.id = a.lote_id AND l.deleted_at IS NULL
         WHERE a.deleted_at IS NULL AND ${visibleLote('l', 1, 2)}
         GROUP BY a.estado`,
        alcance,
      ) as Promise<{ estado: string; total: number }[]>,
      this.ds.query(
        `SELECT COUNT(*)::int AS total
         FROM usuarios u
         JOIN roles r ON r.id = u.rol_id
         WHERE u.eliminado_en IS NULL AND u.estado = 'activo' AND r.nombre ILIKE 'aprendiz%'
           AND ($1::boolean OR u.programa_formacion_id = ANY($2::int[]))`,
        alcance,
      ) as Promise<{ total: number }[]>,
    ]);

    const nombre = (n: string, a: string | null) => [n, a].filter(Boolean).join(' ');
    const lineas: string[] = [
      'GESTIÓN DE TAREAS (de los lotes que este usuario puede ver):',
      `Aprendices activos a cargo: ${aprendices[0]?.total ?? 0}.`,
      `Actividades por estado: ${actividades.map((a) => `${a.estado} ${a.total}`).join(', ') || 'ninguna'}.`,
      `Asignaciones por estado: ${conteo.map((c) => `${ESTADO_TAREA[c.estado] ?? c.estado} ${c.total}`).join(', ') || 'ninguna'}.`,
    ];

    lineas.push(porRevisar.length > 0 ? 'Entregas esperando revisión:' : 'Entregas esperando revisión: ninguna.');
    porRevisar.forEach((e) =>
      lineas.push(
        `- ${nombre(e.nombre, e.apellido)} | ${e.actividad} | entregada ${formatoFecha(e.entregada_en)}` +
          (e.horas_trabajadas !== null ? ` | ${numero(e.horas_trabajadas)} h` : ''),
      ),
    );

    lineas.push(vencidas.length > 0 ? 'Tareas vencidas sin entregar:' : 'Tareas vencidas sin entregar: ninguna.');
    vencidas.forEach((v) =>
      lineas.push(`- ${nombre(v.nombre, v.apellido)} | ${v.actividad} | venció ${formatoDia(v.fecha_limite)} | ${ESTADO_TAREA[v.estado] ?? v.estado}`),
    );

    if (proximas.length > 0) {
      lineas.push('Plazos de los próximos 7 días:');
      proximas.forEach((p) => lineas.push(`- ${p.actividad} | ${p.aprendices} aprendiz(es) pendientes | vence ${formatoDia(p.fecha)}`));
    }

    return lineas.join('\n');
  }
}
