import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
    ClimaPorPeriodo,
    FinanzasPorPeriodo,
    LuzDelDia,
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
            SELECT date_trunc('${u}', COALESCE(lp.fecha_cosecha::timestamp, lp.created_at)) AS inicio,
                   COALESCE(c."nombreCultivo", 'Sin cultivo') AS cultivo,
                   SUM(lp.cantidad_kg) AS kg
            FROM lotes_produccion lp
            LEFT JOIN cultivos c ON c.id = lp.cultivo_id AND c.deleted_at IS NULL
            WHERE lp.deleted_at IS NULL AND COALESCE(lp.fecha_cosecha::timestamp, lp.created_at) >= $1
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
            WHERE lp.deleted_at IS NULL AND COALESCE(lp.fecha_cosecha::timestamp, lp.created_at) >= $1
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

    // La medida sale del nombre del tipo de sensor (o del sensor), igual que en
    // el frontend. El valor se guarda como texto: solo cuentan los que son número.
    private static readonly LECTURAS = `
        SELECT l.fecha_lectura AS fecha,
               CASE WHEN l.valor ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN l.valor::numeric END AS valor,
               CASE
                   WHEN LOWER(COALESCE(t.nombre, s.nombre_sensor)) LIKE '%temp%' THEN 'temperatura'
                   WHEN LOWER(COALESCE(t.nombre, s.nombre_sensor)) LIKE '%hum%' THEN 'humedad'
                   WHEN LOWER(COALESCE(t.nombre, s.nombre_sensor)) LIKE '%uv%'
                     OR LOWER(COALESCE(t.nombre, s.nombre_sensor)) LIKE '%ultraviolet%' THEN 'uv'
                   WHEN LOWER(COALESCE(t.nombre, s.nombre_sensor)) LIKE '%lumin%'
                     OR LOWER(COALESCE(t.nombre, s.nombre_sensor)) LIKE '%lux%'
                     OR LOWER(COALESCE(t.nombre, s.nombre_sensor)) LIKE '%luz%' THEN 'luz'
               END AS medida
        FROM sensor_lecturas l
        JOIN sensores s ON s.id = l.sensor_id
        LEFT JOIN tipos_sensores t ON t.id = s.tipo_sensor_id
        WHERE l.eliminado_en IS NULL
    `;

    async climaPorPeriodo(unidad: string, desde: Date): Promise<ClimaPorPeriodo[]> {
        const u = this.unidadSegura(unidad);
        const filas = await this.dataSource.query(
            `
            SELECT date_trunc('${u}', x.fecha) AS inicio,
                   AVG(x.valor) FILTER (WHERE x.medida = 'temperatura') AS temperatura,
                   AVG(x.valor) FILTER (WHERE x.medida = 'humedad') AS humedad,
                   AVG(x.valor) FILTER (WHERE x.medida = 'uv') AS uv
            FROM (${ReportesRepositoryImpl.LECTURAS}) x
            WHERE x.valor IS NOT NULL AND x.fecha >= $1
              AND x.medida IN ('temperatura', 'humedad', 'uv')
            GROUP BY 1
            ORDER BY 1 ASC
            `,
            [desde],
        );
        const redondear = (v: unknown) => (v === null || v === undefined ? null : Math.round(Number(v) * 10) / 10);
        return filas.map((f: any) => ({
            inicio: new Date(f.inicio),
            temperatura: redondear(f.temperatura),
            humedad: redondear(f.humedad),
            uv: redondear(f.uv),
        }));
    }

    async luzDeHoy(): Promise<LuzDelDia> {
        // "Hoy" en Colombia, no en UTC
        const filas = await this.dataSource.query(
            `
            WITH hoy AS (
                SELECT date_trunc('hour', x.fecha AT TIME ZONE 'America/Bogota') AS hora, x.valor
                FROM (${ReportesRepositoryImpl.LECTURAS}) x
                WHERE x.medida = 'luz' AND x.valor IS NOT NULL
                  AND (x.fecha AT TIME ZONE 'America/Bogota')::date = (now() AT TIME ZONE 'America/Bogota')::date
            )
            SELECT (SELECT AVG(valor) FROM hoy WHERE valor > 0) AS promedio,
                   (SELECT COUNT(*) FROM (SELECT hora FROM hoy GROUP BY hora HAVING AVG(valor) > 10000) h) AS horas
            `,
        );
        const promedio = filas[0]?.promedio;
        return {
            promedioLux: promedio === null || promedio === undefined ? null : Math.round(Number(promedio)),
            horasLuz: aNumero(filas[0]?.horas),
        };
    }
}
