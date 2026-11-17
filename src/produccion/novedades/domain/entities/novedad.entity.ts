/** Qué está reportando el aprendiz. */
export type TipoNovedad = 'insumo_bajo' | 'herramienta_danada' | 'problema_cultivo' | 'otro';

/** Se reusa la escala de incidencias para que StatusBadge ya la conozca. */
export type UrgenciaNovedad = 'low' | 'medium' | 'high';

export type EstadoNovedad = 'pendiente' | 'atendida' | 'descartada';

export const ESTADOS_NOVEDAD: EstadoNovedad[] = ['pendiente', 'atendida', 'descartada'];

export class Novedad {
    constructor(
        public readonly id: number | null,
        public tipo: TipoNovedad,
        public urgencia: UrgenciaNovedad,
        public estado: EstadoNovedad,
        public descripcion: string,
        public readonly reportadaPorUsuarioId: number,
        public actividadId: number | null,
        public insumoId: number | null,
        public nombreHerramienta: string | null,
        public respuestaInstructor: string | null,
        public respondidaPorUsuarioId: number | null,
        public respondidaEn: Date | null,
        public readonly creadoEn: Date = new Date(),
    ) {}

    /**
     * Atender o descartar es la misma transición con distinto desenlace. Lo que
     * cambia es la exigencia: descartar obliga a explicar por qué, porque el
     * aprendiz se queda sin solución; atender no, porque el hecho de estar
     * atendida ya le dice en qué quedó.
     */
    private resolver(estado: EstadoNovedad, respuesta: string | null, instructorId: number): void {
        if (this.estado !== 'pendiente') {
            throw new Error('Esta novedad ya fue resuelta');
        }
        this.estado = estado;
        this.respuestaInstructor = respuesta;
        this.respondidaPorUsuarioId = instructorId;
        this.respondidaEn = new Date();
    }

    atender(respuesta: string | null, instructorId: number): void {
        const texto = respuesta?.trim() ?? '';
        this.resolver('atendida', texto || null, instructorId);
    }

    descartar(respuesta: string, instructorId: number): void {
        const texto = respuesta.trim();
        if (!texto) {
            throw new Error('Escribe el motivo para el aprendiz');
        }
        this.resolver('descartada', texto, instructorId);
    }

    estaPendiente(): boolean {
        return this.estado === 'pendiente';
    }
}
