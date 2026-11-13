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

/** Promedio de cada medida en un tramo de tiempo. null si no hubo lecturas. */
export interface ClimaPorPeriodo {
    inicio: Date;
    temperatura: number | null;
    humedad: number | null;
    uv: number | null;
}

export interface LuzDelDia {
    /** Promedio de las lecturas de luz del día que no son cero (las de noche no cuentan) */
    promedioLux: number | null;
    /** Horas del día en que la luz promedió más de 10.000 lx */
    horasLuz: number;
}

export interface ReportesRepositoryPort {
    produccionPorPeriodo(unidad: string, desde: Date): Promise<ProduccionPorPeriodo[]>;
    finanzasPorPeriodo(unidad: string, desde: Date): Promise<FinanzasPorPeriodo[]>;
    produccionTotalKg(desde: Date): Promise<number>;
    contarUnidadesActivas(): Promise<number>;
    climaPorPeriodo(unidad: string, desde: Date): Promise<ClimaPorPeriodo[]>;
    luzDeHoy(): Promise<LuzDelDia>;
}