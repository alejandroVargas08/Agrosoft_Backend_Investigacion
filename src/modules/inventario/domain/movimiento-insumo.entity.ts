export enum TipoMovimiento {
    ENTRADA = 'entrada',
    SALIDA = 'salida',
    TRASLADO = 'traslado',
    AJUSTE = 'ajuste',
    }

    export interface MovimientoInsumoPropiedades {
    id?: number;
    insumoId: number;
    tipo: TipoMovimiento;
    cantidadPresentacion: number;
    cantidadUso: number;
    costoUnitarioPresentacion: number;
    costoUnitarioUso: number;
    costoTotal: number;
    valorInventarioResultante: number;
    descripcion?: string;
    actividadId?: number;
    usuarioId: number;
    almacenOrigenId?: number;
    almacenDestinoId?: number;
    }

    export class MovimientoInsumo {
    private _id?: number;
    private _insumoId: number;
    private _tipo: TipoMovimiento;
    private _cantidadPresentacion: number;
    private _cantidadUso: number;
    private _costoUnitarioPresentacion: number;
    private _costoUnitarioUso: number;
    private _costoTotal: number;
    private _valorInventarioResultante: number;
    private _descripcion?: string;
    private _actividadId?: number;
    private _usuarioId: number;
    private _almacenOrigenId?: number;
    private _almacenDestinoId?: number;

    private constructor(props: MovimientoInsumoPropiedades) {
        this._id = props.id;
        this._insumoId = props.insumoId;
        this._tipo = props.tipo;
        this._cantidadPresentacion = props.cantidadPresentacion;
        this._cantidadUso = props.cantidadUso;
        this._costoUnitarioPresentacion = props.costoUnitarioPresentacion;
        this._costoUnitarioUso = props.costoUnitarioUso;
        this._costoTotal = props.costoTotal;
        this._valorInventarioResultante = props.valorInventarioResultante;
        this._descripcion = props.descripcion;
        this._actividadId = props.actividadId;
        this._usuarioId = props.usuarioId;
        this._almacenOrigenId = props.almacenOrigenId;
        this._almacenDestinoId = props.almacenDestinoId;
    }

    static crear(props: Omit<MovimientoInsumoPropiedades, 'id' | 'costoTotal'>): MovimientoInsumo {
        if (props.cantidadUso <= 0) throw new Error('La cantidad del movimiento debe ser positiva');
        if (props.tipo === TipoMovimiento.TRASLADO && (!props.almacenOrigenId || !props.almacenDestinoId)) {
        throw new Error('Un traslado requiere almacén origen y destino');
        }
        const costoTotal = Math.round(props.cantidadUso * props.costoUnitarioUso * 100) / 100;
        return new MovimientoInsumo({ ...props, costoTotal });
    }

    static reconstruir(props: Required<Pick<MovimientoInsumoPropiedades, 'id'>> & MovimientoInsumoPropiedades): MovimientoInsumo {
        return new MovimientoInsumo(props);
    }

    get id() { return this._id; }
    get insumoId() { return this._insumoId; }
    get tipo() { return this._tipo; }
    get cantidadPresentacion() { return this._cantidadPresentacion; }
    get cantidadUso() { return this._cantidadUso; }
    get costoUnitarioPresentacion() { return this._costoUnitarioPresentacion; }
    get costoUnitarioUso() { return this._costoUnitarioUso; }
    get costoTotal() { return this._costoTotal; }
    get valorInventarioResultante() { return this._valorInventarioResultante; }
    get descripcion() { return this._descripcion; }
    get actividadId() { return this._actividadId; }
    get usuarioId() { return this._usuarioId; }
    get almacenOrigenId() { return this._almacenOrigenId; }
    get almacenDestinoId() { return this._almacenDestinoId; }
}