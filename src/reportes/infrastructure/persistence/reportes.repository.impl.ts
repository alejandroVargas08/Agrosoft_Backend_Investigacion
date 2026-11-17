import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
    FinanzasPorPeriodo,
    ProduccionPorPeriodo,
    ReportesRepositoryPort,
} from '../../domain/ports/reportes.repository.port';

// Solo se aceptan estas tres unidades para date_trunc, nunca texto del usuario
const UNIDADES_VALIDAS = ['month', 'quarter', 'year'];

const aNumero = (valor: unknown): number => {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
};

@Injectable()
export class ReportesRepositoryImpl implements ReportesRepositoryPort {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    private unidadSegura(unidad: string): string {
        return UNIDADES_VALIDAS.includes(unidad) ? unidad : 'month';
    }

    async produccionPorPeriodo(unidad: string, desde: Date): Promise<ProduccionPorPeriodo[]> {
        const u = this.unidadSegura(unidad);
        const filas = await this.dataSource.query(
            `
            SELECT date_trunc('${u}', lp.created_at) AS inicio,
                   COALESCE(c."nombreCultivo", 'Sin cultivo') AS cultivo,
                   SUM(lp.cantidad_kg) AS kg
            FROM lotes_produccion lp
            LEFT JOIN cultivos c ON c.id = lp.cultivo_id AND c.deleted_at IS NULL
            WHERE lp.deleted_at IS NULL AND lp.created_at >= $1
            GROUP BY 1, 2
            ORDER BY 1 ASC
            `,
            [desde],
        );

        return filas.map((f: any) => ({
            inicio: new Date(f.inicio),
            cultivo: String(f.cultivo),
            kg: aNumero(f.kg),
        }));
    }

    async finanzasPorPeriodo(unidad: string, desde: Date): Promise<FinanzasPorPeriodo[]> {
        const u = this.unidadSegura(unidad);
        const filas = await this.dataSource.query(
            `
            SELECT inicio, SUM(ingresos) AS ingresos, SUM(egresos) AS egresos
            FROM (
                SELECT date_trunc('${u}', v.fecha) AS inicio,
                       SUM(v.total) AS ingresos,
                       0 AS egresos
                FROM ventas v
                WHERE v.deleted_at IS NULL
                  AND v.fecha >= $1
                  AND LOWER(v.estado) NOT IN ('anulada', 'cancelled', 'cancelada')
                GROUP BY 1

                UNION ALL

                SELECT date_trunc('${u}', f.fecha) AS inicio,
                       0 AS ingresos,
                       SUM(f.monto) AS egresos
                FROM finanzas f
                WHERE f.deleted_at IS NULL
                  AND f.fecha >= $1
                  AND (LOWER(f.tipo) LIKE '%egres%' OR LOWER(f.tipo) LIKE '%gasto%')
                GROUP BY 1
            ) AS combinado
            GROUP BY inicio
            ORDER BY inicio ASC
            `,
            [desde],
        );

        return filas.map((f: any) => ({
            inicio: new Date(f.inicio),
            ingresos: aNumero(f.ingresos),
            egresos: aNumero(f.egresos),
        }));
    }

    async produccionTotalKg(desde: Date): Promise<number> {
        const filas = await this.dataSource.query(
            `
            SELECT COALESCE(SUM(lp.cantidad_kg), 0) AS total
            FROM lotes_produccion lp
            WHERE lp.deleted_at IS NULL AND lp.created_at >= $1
            `,
            [desde],
        );
        return aNumero(filas[0]?.total);
    }

    async contarUnidadesActivas(): Promise<number> {
        const filas = await this.dataSource.query(
            `
            SELECT COUNT(*) AS total
            FROM cultivos c
            WHERE c.deleted_at IS NULL AND LOWER(c.estado) = 'activo'
            `,
        );
        return aNumero(filas[0]?.total);
    }
}