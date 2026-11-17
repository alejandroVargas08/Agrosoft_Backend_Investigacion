export const Reportes_Repository = Symbol('Reportes_Repository');

export interface ProduccionPorPeriodo {
    inicio: Date;
    cultivo: string;
    kg: number;
}

export interface FinanzasPorPeriodo {
    inicio: Date;
    ingresos: number;
    egresos: number;
}

export interface ReportesRepositoryPort {
    produccionPorPeriodo(unidad: string, desde: Date): Promise<ProduccionPorPeriodo[]>;
    finanzasPorPeriodo(unidad: string, desde: Date): Promise<FinanzasPorPeriodo[]>;
    produccionTotalKg(desde: Date): Promise<number>;
    contarUnidadesActivas(): Promise<number>;
}