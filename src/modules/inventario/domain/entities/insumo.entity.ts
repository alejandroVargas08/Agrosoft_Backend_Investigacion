export enum EstadoInsumo {
    ACTIVO = 'activo',
    INACTIVO = 'inactivo',
    AGOTADO = 'agotado',
    DE_BAJA = 'de_baja',
    }

    export enum TipoInsumo {
    CONSUMIBLE = 'consumible',
    HERRAMIENTA = 'herramienta',
    }

    export interface InsumoPropiedades {
    id?: number;
    nombre: string;
    descripcion?: string;
    fotoUrl?: string;
    presentacionTipo: string;
    presentacionCantidad: number;
    presentacionUnidad: string;
    unidadUso: string;
    tipoMateria?: string;
    factorConversionUso: number;
    stockPresentacion: number;
    stockUso: number;
    stockReservado: number;
    stockMinimo: number;
    precioUnitarioPresentacion: number;
    precioUnitarioUso: number;
    almacenId: number;
    proveedorId: number;
    categoriaId: number;
    tipoInsumo: TipoInsumo;
    estado: EstadoInsumo;
    costoAdquisicion?: number;
    valorResidual?: number;
    vidaUtilHoras?: number;
    horasUsadas?: number;
    depreciacionAcumulada?: number;
    creadoPorUsuarioId?: number;
    deletedAt?: Date | null;
    }

    export class Insumo {
    private _id?: number;
    private _nombre: string;
    private _descripcion?: string;
    private _fotoUrl?: string;
    private _presentacionTipo: string;
    private _presentacionCantidad: number;
    private _presentacionUnidad: string;
    private _unidadUso: string;
    private _tipoMateria?: string;
    private _factorConversionUso: number;
    private _stockPresentacion: number;
    private _stockUso: number;
    private _stockReservado: number;
    private _stockMinimo: number;
    private _precioUnitarioPresentacion: number;
    private _precioUnitarioUso: number;
    private _almacenId: number;
    private _proveedorId: number;
    private _categoriaId: number;
    private _tipoInsumo: TipoInsumo;
    private _estado: EstadoInsumo;
    private _costoAdquisicion?: number;
    private _valorResidual?: number;
    private _vidaUtilHoras?: number;
    private _horasUsadas?: number;
    private _depreciacionAcumulada?: number;
    private _creadoPorUsuarioId?: number;
    private _deletedAt?: Date | null;

    private constructor(props: InsumoPropiedades) {
        this._id = props.id;
        this._nombre = props.nombre;
        this._descripcion = props.descripcion;
        this._fotoUrl = props.fotoUrl;
        this._presentacionTipo = props.presentacionTipo;
        this._presentacionCantidad = props.presentacionCantidad;
        this._presentacionUnidad = props.presentacionUnidad;
        this._unidadUso = props.unidadUso;
        this._tipoMateria = props.tipoMateria;
        this._factorConversionUso = props.factorConversionUso;
        this._stockPresentacion = props.stockPresentacion;
        this._stockUso = props.stockUso;
        this._stockReservado = props.stockReservado;
        this._stockMinimo = props.stockMinimo;
        this._precioUnitarioPresentacion = props.precioUnitarioPresentacion;
        this._precioUnitarioUso = props.precioUnitarioUso;
        this._almacenId = props.almacenId;
        this._proveedorId = props.proveedorId;
        this._categoriaId = props.categoriaId;
        this._tipoInsumo = props.tipoInsumo;
        this._estado = props.estado;
        this._costoAdquisicion = props.costoAdquisicion;
        this._valorResidual = props.valorResidual;
        this._vidaUtilHoras = props.vidaUtilHoras;
        this._horasUsadas = props.horasUsadas;
        this._depreciacionAcumulada = props.depreciacionAcumulada;
        this._creadoPorUsuarioId = props.creadoPorUsuarioId;
        this._deletedAt = props.deletedAt ?? null;
    }

    static crear(props: Omit<InsumoPropiedades, 'id' | 'deletedAt' | 'stockReservado'>): Insumo {
        if (!props.nombre?.trim()) throw new Error('El nombre del insumo es requerido');
        if (props.stockPresentacion < 0 || props.stockUso < 0) {
        throw new Error('El stock inicial no puede ser negativo');
        }
        return new Insumo({ ...props, stockReservado: 0 });
    }

    static reconstruir(props: Required<Pick<InsumoPropiedades, 'id'>> & InsumoPropiedades): Insumo {
        return new Insumo(props);
    }

    stockDisponible(): number {
        return this._stockUso - this._stockReservado;
    }

    estaBajoStockMinimo(): boolean {
        return this._stockUso <= this._stockMinimo;
    }

    reservar(cantidad: number): void {
        if (cantidad <= 0) throw new Error('La cantidad a reservar debe ser positiva');
        if (cantidad > this.stockDisponible()) {
        throw new Error(
            `No hay suficiente stock disponible para reservar (disponible: ${this.stockDisponible()}, solicitado: ${cantidad})`,
        );
        }
        this._stockReservado += cantidad;
    }

    liberarReserva(cantidad: number): void {
        if (cantidad <= 0) throw new Error('La cantidad a liberar debe ser positiva');
        if (cantidad > this._stockReservado) {
        throw new Error('No se puede liberar más de lo reservado');
        }
        this._stockReservado -= cantidad;
    }

    descontarStock(cantidadUso: number, cantidadPresentacion: number): void {
        if (cantidadUso > this._stockUso) {
        throw new Error('Stock insuficiente para el movimiento de salida');
        }
        this._stockUso -= cantidadUso;
        this._stockPresentacion -= cantidadPresentacion;
        if (this._stockUso <= 0) this._estado = EstadoInsumo.AGOTADO;
    }

    agregarStock(cantidadUso: number, cantidadPresentacion: number): void {
        this._stockUso += cantidadUso;
        this._stockPresentacion += cantidadPresentacion;
        if (this._estado === EstadoInsumo.AGOTADO) this._estado = EstadoInsumo.ACTIVO;
    }

    valorInventario(): number {
        return this._stockUso * this._precioUnitarioUso;
    }

    eliminar(): void {
        this._deletedAt = new Date();
        this._estado = EstadoInsumo.DE_BAJA;
    }

    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get descripcion() { return this._descripcion; }
    get fotoUrl() { return this._fotoUrl; }
    get presentacionTipo() { return this._presentacionTipo; }
    get presentacionCantidad() { return this._presentacionCantidad; }
    get presentacionUnidad() { return this._presentacionUnidad; }
    get unidadUso() { return this._unidadUso; }
    get tipoMateria() { return this._tipoMateria; }
    get factorConversionUso() { return this._factorConversionUso; }
    get stockPresentacion() { return this._stockPresentacion; }
    get stockUso() { return this._stockUso; }
    get stockReservado() { return this._stockReservado; }
    get stockMinimo() { return this._stockMinimo; }
    get precioUnitarioPresentacion() { return this._precioUnitarioPresentacion; }
    get precioUnitarioUso() { return this._precioUnitarioUso; }
    get almacenId() { return this._almacenId; }
    get proveedorId() { return this._proveedorId; }
    get categoriaId() { return this._categoriaId; }
    get tipoInsumo() { return this._tipoInsumo; }
    get estado() { return this._estado; }
    get costoAdquisicion() { return this._costoAdquisicion; }
    get valorResidual() { return this._valorResidual; }
    get vidaUtilHoras() { return this._vidaUtilHoras; }
    get horasUsadas() { return this._horasUsadas; }
    get depreciacionAcumulada() { return this._depreciacionAcumulada; }
    get creadoPorUsuarioId() { return this._creadoPorUsuarioId; }
    get deletedAt() { return this._deletedAt; }
    }