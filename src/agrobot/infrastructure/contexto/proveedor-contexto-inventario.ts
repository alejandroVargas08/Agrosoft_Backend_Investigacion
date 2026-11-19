import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { numero, pesos } from './formato';

@Injectable()
export class ProveedorContextoInventario implements ProveedorContextoPort {
  readonly fuente = 'inventario' as const;

  constructor(private readonly ds: DataSource) {}

  async obtener(usuario: UsuarioAutenticado): Promise<string> {
    const verValor = usuario.permisos.includes('finanzas.ver');

    const [resumen, insumos] = await Promise.all([
      this.ds.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE (i.stock_uso - i.stock_reservado) < i.stock_minimo)::int AS bajos,
                COUNT(*) FILTER (WHERE i.tipo_insumo = 'herramienta')::int AS herramientas,
                COALESCE(SUM(i.stock_presentacion * i.precio_unitario_presentacion), 0)::float AS valor
         FROM insumos i
         WHERE i.deleted_at IS NULL`,
      ) as Promise<{ total: number; bajos: number; herramientas: number; valor: number }[]>,
      this.ds.query(
        `SELECT i.nombre, i.tipo_insumo AS tipo, i.unidad_uso AS unidad, i.estado,
                i.stock_uso::float AS stock, i.stock_reservado::float AS reservado, i.stock_minimo::float AS minimo,
                ((i.stock_uso - i.stock_reservado) < i.stock_minimo) AS bajo
         FROM insumos i
         WHERE i.deleted_at IS NULL
         ORDER BY ((i.stock_uso - i.stock_reservado) < i.stock_minimo) DESC, i.nombre ASC
         LIMIT 30`,
      ) as Promise<{
        nombre: string;
        tipo: string;
        unidad: string;
        estado: string;
        stock: number;
        reservado: number;
        minimo: number;
        bajo: boolean;
      }[]>,
    ]);

    const r = resumen[0];
    if (!r || r.total === 0) return 'INVENTARIO: no hay insumos registrados.';

    const cabecera =
      `INVENTARIO: ${r.total} insumos registrados, ${r.herramientas} herramientas, ${r.bajos} por debajo del stock mínimo` +
      (verValor ? `, valor total aproximado ${pesos(r.valor)}` : '') +
      '.';

    const lineas = insumos.map(
      (i) =>
        `- ${i.nombre} (${i.tipo}) | disponible ${numero(i.stock - i.reservado)} ${i.unidad}` +
        ` | reservado ${numero(i.reservado)} | mínimo ${numero(i.minimo)} | estado ${i.estado}` +
        (i.bajo ? ' | BAJO EL MÍNIMO' : ''),
    );

    return [cabecera, ...lineas].join('\n');
  }
}
