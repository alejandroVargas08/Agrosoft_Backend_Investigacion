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
     * Atender o descartar es la misma transición con distinto desenlace, y las
     * dos exigen que el instructor escriba algo: el aprendiz tiene que saber
     * en qué quedó lo que reportó.
     */
    private resolver(estado: EstadoNovedad, respuesta: string, instructorId: number): void {
        if (this.estado !== 'pendiente') {
            throw new Error('Esta novedad ya fue resuelta');
        }
        if (!respuesta.trim()) {
            throw new Error('Escribe una respuesta para el aprendiz');
        }
        this.estado = estado;
        this.respuestaInstructor = respuesta.trim();
        this.respondidaPorUsuarioId = instructorId;
        this.respondidaEn = new Date();
    }

    atender(respuesta: string, instructorId: number): void {
        this.resolver('atendida', respuesta, instructorId);
    }

    descartar(respuesta: string, instructorId: number): void {
        this.resolver('descartada', respuesta, instructorId);
    }

    estaPendiente(): boolean {
        return this.estado === 'pendiente';
    }
}
