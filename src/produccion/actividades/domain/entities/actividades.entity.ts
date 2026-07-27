export type estadoActividad = 'Pendiente' | 'En_progreso' | 'Finalizada' | 'Cancelada';


export class Actividades {
    constructor(
        public readonly id: number | null,
        public readonly nombre: string,
        public readonly tipo: string,
        public readonly subtipo: string,
        public readonly loteId: number,
        public readonly subLoteId: number | null,
        public readonly cultivoId: number,
        public readonly fecha: Date,
        public readonly horasActividad: number,
        public readonly precioHoraActividad: number,
        public costoManoObra: number,
        public readonly descripcion: string,
        public estado: string,
        public readonly creadoPorUsuarioId: number,
        public readonly cantidadPlantas: number | null,
        public readonly kgRecolectados: number | null,
        public readonly productoAgroId: number | null,
    ) {}

    static crear(props: {
        nombre: string;
        tipo: string;
        subtipo?: string | null;
        loteId: number;
        subLoteId?: number | null; 
        cultivoId: number;
        fecha: Date;
        horasActividad: number; 
        precioHoraActividad: number; 
        descripcion?: string; 
        creadoPorUsuarioId: number; 
        cantidadPlantas: number | null; 
        productoAgroId: number | null;
    }): Actividades {
        if (props.horasActividad <0 ) {
            throw new Error('Las horas de la actividad no pueden ser negativas');
        }
        if (props.precioHoraActividad <0) {
            throw new Error('El precio por hora no puede ser negativo');
        }
        const costoManoObra = props.horasActividad * props.precioHoraActividad;

    return new Actividades(
        null,
        props.nombre,
        props.tipo,
        props.subtipo ?? null,
        props.loteId,
        props.subLoteId ?? null,
        props.cuktivoId,
        props.fecha,
        props.horasActividad,
        props.precioHoraActividad,
        costoManoObra,
        props.descripcion,
        'pendiente',
        props.creadoPorUsuarioId,
        props.cantidadPlantas ?? null,
        null,
        props.productoAgroId ?? null,
    );
}

actualizarHorasPrecio(horasActividad: number,precioHoraActividad: number) {
    if(horasActividad <0 || precioHoraActividad <0) {
        throw new Error('Los valores deben de ser positivos');
    }
    this.horasActividad = horasActividad;
    this.precioHoraActividad = precioHoraActividad;
    this.costoManoObra = horasActividad * precioHoraActividad;
}

cambiarEstado(nuevoEstado: estadoActividad) {
    const transiciconesValidas: Record<estadoActividad, estadoActividad[]> = {
        Pendiente: ['En_progreso', 'Cancelada'],
        En_progreso: ['Finalizada', 'Cancelada'],
        Finalizada: [],
        Cancelada: [],
    };
    if (!transiciconesValidas[this.estado].includes(nuevoEstado)) {
        throw new Error(`No se puede pasar de estado "${this.estado}" a "${nuevoEstado}"`);
    }
    this.estado = nuevoEstado;
}

registrarCosecha(kgRecolectados: number) {
    if(kgRecolectados <0) throw new Error('kgRecolectados no puede ser negativo');
    if(this.estado === 'cancelada') {
        throw new Error('No se puede registrar cosecha en una actividad cancelada');
    }
    this.kgRecolectados = kgRecolectados;
}
}