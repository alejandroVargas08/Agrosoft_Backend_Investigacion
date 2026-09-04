import { Area } from '../value-objects/area.vo';
import { PoligonoGeografico } from '../value-objects/poligono-geografico.vo';
import { PuntoGeografico } from '../value-objects/punto-geografico.vo';
import { EstadoLote } from './lote.entity';

export interface SubLotePropiedades {
    id?: number;
    loteId: number;
    nombre: string;
    poligono: PoligonoGeografico;
    area: Area;
    centroide: PuntoGeografico;
    descripcion?: string;
    estado: EstadoLote;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class SubLote {
    private _id?: number;
    private _loteId: number;
    private _nombre: string;
    private _poligono: PoligonoGeografico;
    private _area: Area;
    private _centroide: PuntoGeografico;
    private _descripcion?: string;
    private _estado: EstadoLote;
    private readonly _createdAt?: Date;
    private _updatedAt?: Date;
    private _deletedAt?: Date | null;

private constructor(props: SubLotePropiedades) {
    this._id = props.id;
    this._loteId = props.loteId;
    this._nombre = props.nombre;
    this._poligono = props.poligono;
    this._area = props.area;
    this._centroide = props.centroide;
    this._descripcion = props.descripcion;
    this._estado = props.estado;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._deletedAt = props.deletedAt ?? null;
}

static crear(props: Omit<SubLotePropiedades, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): SubLote {
    if (!props.nombre || props.nombre.trim().length === 0) {
        throw new Error('El nombre del sublote es requerido');
    }
    if (!props.loteId) {
        throw new Error('Un sublote debe pertenecer a un lote');
    }
    return new SubLote({ ...props, estado: props.estado ?? EstadoLote.ACTIVO });
}

static reconstruir(props: Required<Pick<SubLotePropiedades, 'id'>> & SubLotePropiedades): SubLote {
    return new SubLote(props);
}

actualizarEstado(nuevoEstado: EstadoLote): void {
    if (this._deletedAt) {
        throw new Error('No se puede cambiar el estado de un sublote eliminado');
    }
    this._estado = nuevoEstado;
    this._updatedAt = new Date();
}

eliminar(): void {
    this._deletedAt = new Date();
    this._updatedAt = new Date();
}

estaActivo(): boolean {
    return this._estado === EstadoLote.ACTIVO && !this._deletedAt;
}

get id() { return this._id; }
get loteId() { return this._loteId; }
get nombre() { return this._nombre; }
get poligono() { return this._poligono; }
get area() { return this._area; }
get centroide() { return this._centroide; }
get descripcion() { return this._descripcion; }
get estado() { return this._estado; }
get deletedAt() { return this._deletedAt; }
}