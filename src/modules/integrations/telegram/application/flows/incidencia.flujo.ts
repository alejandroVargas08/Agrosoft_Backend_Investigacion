import { Flujo } from './flujo.types';

export const FLUJO_INCIDENCIA: Flujo = {
    comando: 'incidencia',
    nombre: 'Nueva incidencia',
    pasos: [
        {
            campo: 'titulo',
            pregunta: '📝 ¿Cuál es el título de la incidencia?\n\nEjemplo: Brote de mildiu en tomate',
        },
        {
            campo: 'tipo',
            pregunta: '🔍 ¿De qué tipo es?',
            opciones: [
                { etiqueta: 'Enfermedad fúngica', valor: 'Enfermedad fúngica' },
                { etiqueta: 'Enfermedad bacteriana', valor: 'Enfermedad bacteriana' },
                { etiqueta: 'Plaga de insectos', valor: 'Plaga de insectos' },
                { etiqueta: 'Arvense', valor: 'Arvense' },
                { etiqueta: 'Deficiencia nutricional', valor: 'Deficiencia nutricional' },
                { etiqueta: 'Otro', valor: 'Otro' },
            ],
        },
        {
            campo: 'severidad',
            pregunta: '⚠️ ¿Qué tan grave es?',
            opciones: [
                { etiqueta: 'Baja', valor: 'low' },
                { etiqueta: 'Media', valor: 'medium' },
                { etiqueta: 'Alta', valor: 'high' },
            ],
        },
        {
            campo: 'cultivoId',
            pregunta: '🌱 ¿Número de la unidad productiva afectada?\n\nEscribe "-" si no aplica.',
            formato: 'numero',
            opcional: true,
        },
        {
            campo: 'descripcion',
            pregunta: '🗒️ Describe lo que observaste.\n\nEscribe "-" para omitir.',
            opcional: true,
        },
    ],
};