import { ValueTransformer } from 'typeorm';

/**
 * Para columnas `date` (solo día). El driver de Postgres convierte un Date a
 * hora de Colombia antes de mandarlo: el 13 de noviembre a medianoche UTC
 * llegaba como "12 a las 7 p. m." y la base se quedaba con el 12. Cada fecha
 * elegida en la app se guardaba un día antes.
 *
 * Aquí se manda el día como texto. Un Date a medianoche UTC es una fecha que
 * vino como "2026-11-13" y se toma tal cual; uno con hora es un momento real
 * y se toma el día en Colombia.
 */
const diaDe = (fecha: Date): string => {
    const esSoloDia =
        fecha.getUTCHours() === 0 && fecha.getUTCMinutes() === 0 &&
        fecha.getUTCSeconds() === 0 && fecha.getUTCMilliseconds() === 0;
    if (esSoloDia) return fecha.toISOString().slice(0, 10);
    return fecha.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
};

export const fechaSinHora: ValueTransformer = {
    to: (valor: unknown) => {
        if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : diaDe(valor);
        return valor;
    },
    // Al leer, TypeORM ya entrega el texto "AAAA-MM-DD": se deja igual
    from: (valor: unknown) => valor,
};
