import { Flujo } from './flujo.types';

export const FLUJO_TRATAMIENTO: Flujo = {
    comando: 'tratamiento',
    nombre: 'Nuevo tratamiento',
    pasos: [
        {
            campo: 'incidenciaId',
            pregunta: '🩺 ¿A qué incidencia corresponde?\n\nEscribe "-" si no aplica a ninguna.',
            fuente: 'incidencias',
            formato: 'numero',
            opcional: true,
        },
        {
            campo: 'producto',
            pregunta: '💊 ¿Qué producto aplicaste?\n\nEjemplo: Azufre micronizado 80%',
        },
        {
            campo: 'dosis',
            pregunta: '⚗️ ¿En qué dosis?\n\nEjemplo: 3g/L. Escribe "-" para omitir.',
            opcional: true,
        },
        {
            campo: 'fecha',
            pregunta: '📅 ¿Qué día se aplicó?\n\nFormato AAAA-MM-DD. Ejemplo: 2026-10-19\nEscribe "-" para hoy.',
            formato: 'fecha',
            opcional: true,
        },
        {
            campo: 'costo',
            pregunta: '💰 ¿Cuánto costó en pesos?\n\nSolo el número. Escribe "-" para omitir.',
            formato: 'numero',
            opcional: true,
        },
        {
            campo: 'notas',
            pregunta: '🗒️ Notas del tratamiento.\n\nEscribe "-" para omitir.',
            opcional: true,
        },
    ],
};