export enum EstadoReserva {
    PENDIENTE = 'pendiente',
    CONFIRMADA = 'confirmada',
    CANCELADA = 'cancelada',
    }

    export interface ReservaPropiedades {
    id?: number;
    insumoId: number;
    cantidad: number;
    fechaReserva: Date;
    motivo?: string;
    estado: EstadoReserva;
    usuarioId: number;
    actividadId?: number;
    }

    export class Reserva {
    private _id?: number;
    private _insumoId: number;
    private _cantidad: number;
    private _fechaReserva: Date;
    private _motivo?: string;
    private _estado: EstadoReserva;
    private _usuarioId: number;
    private _actividadId?: number;

    private constructor(props: ReservaPropiedades) {
        this._id = props.id;
        this._insumoId = props.insumoId;
        this._cantidad = props.cantidad;
        this._fechaReserva = props.fechaReserva;
        this._motivo = props.motivo;
        this._estado = props.estado;
        this._usuarioId = props.usuarioId;
        this._actividadId = props.actividadId;
    }

    static crear(props: Omit<ReservaPropiedades, 'id' | 'estado'>): Reserva {
        if (props.cantidad <= 0) throw new Error('La cantidad reservada debe ser positiva');
        return new Reserva({ ...props, estado: EstadoReserva.PENDIENTE });
    }

    static reconstruir(props: Required<Pick<ReservaPropiedades, 'id'>> & ReservaPropiedades): Reserva {
        return new Reserva(props);
    }

    confirmar(): void {
        if (this._estado !== EstadoReserva.PENDIENTE) {
        throw new Error('Solo una reserva pendiente puede confirmarse');
        }
        this._estado = EstadoReserva.CONFIRMADA;
    }

    cancelar(): void {
        if (this._estado === EstadoReserva.CONFIRMADA) {
        throw new Error('No se puede cancelar una reserva ya confirmada');
        }
        this._estado = EstadoReserva.CANCELADA;
    }

    get id() { return this._id; }
    get insumoId() { return this._insumoId; }
    get cantidad() { return this._cantidad; }
    get fechaReserva() { return this._fechaReserva; }
    get motivo() { return this._motivo; }
    get estado() { return this._estado; }
    get usuarioId() { return this._usuarioId; }
    get actividadId() { return this._actividadId; }
    }