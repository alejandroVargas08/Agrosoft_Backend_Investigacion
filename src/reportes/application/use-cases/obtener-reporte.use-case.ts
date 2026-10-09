import { Inject, Injectable } from '@nestjs/common';
import { Reportes_Repository } from '../../domain/ports/reportes.repository.port';
import type { ReportesRepositoryPort } from '../../domain/ports/reportes.repository.port';
import {
    FilaDistribucion,
    FilaFinanzas,
    FilaProduccion,
    PeriodoReporte,
    ReporteGeneral,
} from '../dtos/reporte.dto';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Cada período define cómo se agrupa en SQL y cuántos tramos hacia atrás se muestran
const CONFIG: Record<PeriodoReporte, { unidad: string; tramos: number }> = {
    mensual: { unidad: 'month', tramos: 6 },
    trimestral: { unidad: 'quarter', tramos: 4 },
    anual: { unidad: 'year', tramos: 5 },
};

@Injectable()
export class ObtenerReporteUseCase {
    constructor(
        @Inject(Reportes_Repository)
        private readonly repositorio: ReportesRepositoryPort,
    ) {}

    private etiqueta(fecha: Date, periodo: PeriodoReporte): string {
        if (periodo === 'anual') return String(fecha.getFullYear());
        if (periodo === 'trimestral') return `T${Math.floor(fecha.getMonth() / 3) + 1} ${fecha.getFullYear()}`;
        return MESES[fecha.getMonth()];
    }

    // Fecha de corte: el inicio del primer tramo que se quiere mostrar
    private calcularDesde(periodo: PeriodoReporte): Date {
        const { tramos } = CONFIG[periodo];
        const hoy = new Date();
        if (periodo === 'anual') return new Date(hoy.getFullYear() - (tramos - 1), 0, 1);
        if (periodo === 'trimestral') {
            const trimestreActual = Math.floor(hoy.getMonth() / 3);
            const inicio = new Date(hoy.getFullYear(), trimestreActual * 3, 1);
            inicio.setMonth(inicio.getMonth() - (tramos - 1) * 3);
            return inicio;
        }
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        inicio.setMonth(inicio.getMonth() - (tramos - 1));
        return inicio;
    }

    async ejecutar(periodoPedido?: string): Promise<ReporteGeneral> {
        const periodo: PeriodoReporte =
            periodoPedido === 'trimestral' || periodoPedido === 'anual'
                ? periodoPedido
                : 'mensual';

        const { unidad } = CONFIG[periodo];
        const desde = this.calcularDesde(periodo);

        const [produccionCruda, finanzasCrudas, produccionTotalKg, unidadesActivas] =
            await Promise.all([
                this.repositorio.produccionPorPeriodo(unidad, desde),
                this.repositorio.finanzasPorPeriodo(unidad, desde),
                this.repositorio.produccionTotalKg(desde),
                this.repositorio.contarUnidadesActivas(),
            ]);

        // Nombres de cultivo que aparecen en el rango: son las series de la gráfica de barras
        const cultivos = [...new Set(produccionCruda.map((f) => f.cultivo))].sort();

        // Una fila por tramo de tiempo, con una columna por cultivo
        const porEtiqueta = new Map<string, FilaProduccion>();
        for (const fila of produccionCruda) {
            const etiqueta = this.etiqueta(fila.inicio, periodo);
            let acumulado = porEtiqueta.get(etiqueta);
            if (!acumulado) {
                acumulado = { periodo: etiqueta };
                for (const cultivo of cultivos) acumulado[cultivo] = 0;
                porEtiqueta.set(etiqueta, acumulado);
            }
            acumulado[fila.cultivo] = Number(acumulado[fila.cultivo] ?? 0) + fila.kg;
        }
        const produccion = [...porEtiqueta.values()];

        // Torta: total de kilos por cultivo en todo el rango
        const totalesPorCultivo = new Map<string, number>();
        for (const fila of produccionCruda) {
            totalesPorCultivo.set(
                fila.cultivo,
                (totalesPorCultivo.get(fila.cultivo) ?? 0) + fila.kg,
            );
        }
        const distribucion: FilaDistribucion[] = [...totalesPorCultivo.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const finanzas: FilaFinanzas[] = finanzasCrudas.map((f) => ({
            periodo: this.etiqueta(f.inicio, periodo),
            ingresos: f.ingresos,
            egresos: f.egresos,
        }));

        const ingresos = finanzas.reduce((suma, f) => suma + f.ingresos, 0);
        const egresos = finanzas.reduce((suma, f) => suma + f.egresos, 0);
        const rentabilidad = ingresos > 0 ? Math.round(((ingresos - egresos) / ingresos) * 100) : 0;

        return {
            periodo,
            resumen: {
                produccionTotalKg: Math.round(produccionTotalKg),
                ingresos,
                egresos,
                rentabilidad,
                unidadesActivas,
            },
            cultivos,
            produccion,
            distribucion,
            finanzas,
        };
    }
}