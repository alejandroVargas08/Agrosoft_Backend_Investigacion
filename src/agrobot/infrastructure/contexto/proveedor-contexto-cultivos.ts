import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { formatoDia, numero, pesos, visibleLote } from './formato';

@Injectable()
export class ProveedorContextoCultivos implements ProveedorContextoPort {
  readonly fuente = 'cultivos' as const;

  constructor(private readonly ds: DataSource) {}

  async obtener(usuario: UsuarioAutenticado): Promise<string> {
    const alcance = [usuario.verTodo, usuario.programasPermitidos];
    const verCostos = usuario.permisos.includes('finanzas.ver');

    const [lotes, cultivos] = await Promise.all([
      this.ds.query(
        `SELECT l.nombre, l."areaHa"::float AS area_ha, l.estado,
                COUNT(c.id) FILTER (WHERE c.deleted_at IS NULL AND c."fechaFinalizacion" IS NULL)::int AS activos
         FROM lotes l
         LEFT JOIN cultivos c ON c.lote_id = l.id
         WHERE l.deleted_at IS NULL AND ${visibleLote('l', 1, 2)}
         GROUP BY l.id
         ORDER BY l.nombre
         LIMIT 30`,
        alcance,
      ) as Promise<{ nombre: string; area_ha: number | null; estado: string; activos: number }[]>,
      this.ds.query(
        `SELECT c."nombreCultivo" AS nombre, c."tipoCultivo" AS tipo, c."fechaSiembra" AS siembra, c.estado,
                c.area_m2::float AS area_m2, c."costoTotal"::float AS costo, l.nombre AS lote,
                (CURRENT_DATE - c."fechaSiembra"::date) AS dias
         FROM cultivos c
         JOIN lotes l ON l.id = c.lote_id AND l.deleted_at IS NULL
         WHERE c.deleted_at IS NULL AND c."fechaFinalizacion" IS NULL AND ${visibleLote('l', 1, 2)}
         ORDER BY c."fechaSiembra" DESC
         LIMIT 30`,
        alcance,
      ) as Promise<{
        nombre: string;
        tipo: string;
        siembra: Date | string;
        estado: string;
        area_m2: number | null;
        costo: number | null;
        lote: string;
        dias: number | null;
      }[]>,
    ]);

    if (lotes.length === 0) return 'LOTES Y CULTIVOS: el usuario no tiene lotes visibles.';

    const lineasLotes = lotes.map(
      (l) => `- ${l.nombre} | ${l.area_ha !== null ? `${numero(l.area_ha)} ha` : 'sin área'} | estado ${l.estado} | cultivos activos ${l.activos}`,
    );
    const lineasCultivos = cultivos.map((c) => {
      const partes = [
        `- ${c.nombre} (${c.tipo})`,
        `lote ${c.lote}`,
        `sembrado ${formatoDia(c.siembra)}${c.dias !== null ? ` (hace ${c.dias} días)` : ''}`,
        `estado ${c.estado}`,
      ];
      if (c.area_m2 !== null) partes.push(`${numero(c.area_m2)} m²`);
      if (verCostos && c.costo !== null) partes.push(`costo acumulado ${pesos(c.costo)}`);
      return partes.join(' | ');
    });

    return [
      `LOTES (${lotes.length}):`,
      ...lineasLotes,
      cultivos.length > 0 ? `CULTIVOS ACTIVOS (${cultivos.length}):` : 'CULTIVOS ACTIVOS: ninguno.',
      ...lineasCultivos,
    ].join('\n');
  }
}
