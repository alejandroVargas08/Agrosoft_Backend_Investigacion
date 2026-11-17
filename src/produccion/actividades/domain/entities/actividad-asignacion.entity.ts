export type EstadoAsignacion = 'ASIGNADA' | 'EN_PROGRESO' | 'ENTREGADA' | 'APROBADA' | 'DEVUELTA';

export const ESTADOS_ACTIVOS_ASIGNACION: EstadoAsignacion[] = ['ASIGNADA', 'EN_PROGRESO', 'DEVUELTA'];

export interface ActividadAsignacionProps {
    id: number | null;
    actividadId: number;
    aprendizId: number;
    asignadoPorId: number;
    estado: EstadoAsignacion;
    fechaLimite: Date | null;
    horasTrabajadas: number | null;
    comentarioAprendiz: string | null;
    comentarioInstructor: string | null;
    iniciadaEn: Date | null;
    entregadaEn: Date | null;
    revisadaEn: Date | null;
    revisadaPorId: number | null;
    creadoEn?: Date;
}

export class ActividadAsignacion {
    private constructor(private props: ActividadAsignacionProps) {}

    static crear(datos: { actividadId: number; aprendizId: number; asignadoPorId: number; fechaLimite: Date | null }): ActividadAsignacion {
        return new ActividadAsignacion({
            id: null,
            actividadId: datos.actividadId,
            aprendizId: datos.aprendizId,
            asignadoPorId: datos.asignadoPorId,
            estado: 'ASIGNADA',
            fechaLimite: datos.fechaLimite,
            horasTrabajadas: null,
            comentarioAprendiz: null,
            comentarioInstructor: null,
            iniciadaEn: null,
            entregadaEn: null,
            revisadaEn: null,
            revisadaPorId: null,
        });
    }

    static desdePersistencia(props: ActividadAsignacionProps): ActividadAsignacion {
        return new ActividadAsignacion(props);
    }

    iniciar(): void {
        if (this.props.estado !== 'ASIGNADA' && this.props.estado !== 'DEVUELTA') {
            throw new Error('Solo puedes empezar una tarea asignada o devuelta');
        }
        this.props.estado = 'EN_PROGRESO';
        this.props.iniciadaEn = this.props.iniciadaEn ?? new Date();
    }

    entregar(horasTrabajadas: number, comentario: string | null): void {
        if (!ESTADOS_ACTIVOS_ASIGNACION.includes(this.props.estado)) {
            throw new Error('Esta tarea ya fue entregada o aprobada');
        }
        if (!(horasTrabajadas > 0)) {
            throw new Error('Las horas trabajadas deben ser mayores a 0');
        }
        this.props.estado = 'ENTREGADA';
        this.props.horasTrabajadas = horasTrabajadas;
        this.props.comentarioAprendiz = comentario;
        this.props.iniciadaEn = this.props.iniciadaEn ?? new Date();
        this.props.entregadaEn = new Date();
    }

    aprobar(revisorId: number, comentario: string | null): void {
        if (this.props.estado !== 'ENTREGADA') throw new Error('Solo se puede aprobar una tarea entregada');
        this.props.estado = 'APROBADA';
        this.props.comentarioInstructor = comentario;
        this.props.revisadaEn = new Date();
        this.props.revisadaPorId = revisorId;
    }

    devolver(revisorId: number, comentario: string): void {
        if (this.props.estado !== 'ENTREGADA') throw new Error('Solo se puede devolver una tarea entregada');
        if (!comentario.trim()) throw new Error('Escribe qué debe corregir el aprendiz');
        this.props.estado = 'DEVUELTA';
        this.props.comentarioInstructor = comentario.trim();
        this.props.revisadaEn = new Date();
        this.props.revisadaPorId = revisorId;
    }

    estaVencida(ahora: Date = new Date()): boolean {
        if (!this.props.fechaLimite || !ESTADOS_ACTIVOS_ASIGNACION.includes(this.props.estado)) return false;
        const limite = new Date(this.props.fechaLimite);
        limite.setHours(23, 59, 59, 999);
        return ahora > limite;
    }

    get id() { return this.props.id; }
    get actividadId() { return this.props.actividadId; }
    get aprendizId() { return this.props.aprendizId; }
    get asignadoPorId() { return this.props.asignadoPorId; }
    get estado() { return this.props.estado; }
    get fechaLimite() { return this.props.fechaLimite; }
    get horasTrabajadas() { return this.props.horasTrabajadas; }
    get comentarioAprendiz() { return this.props.comentarioAprendiz; }
    get comentarioInstructor() { return this.props.comentarioInstructor; }
    get iniciadaEn() { return this.props.iniciadaEn; }
    get entregadaEn() { return this.props.entregadaEn; }
    get revisadaEn() { return this.props.revisadaEn; }
    get revisadaPorId() { return this.props.revisadaPorId; }
    get creadoEn() { return this.props.creadoEn; }

    toProps(): ActividadAsignacionProps {
        return { ...this.props };
    }
}
