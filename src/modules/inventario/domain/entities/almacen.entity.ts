export interface AlmacenPropiedades {
    id?: number;
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    }

    export class Almacen {
    private _id?: number;
    private _nombre: string;
    private _descripcion?: string;
    private _ubicacion?: string;
    private _deletedAt?: Date | null;

    private constructor(props: AlmacenPropiedades) {
        this._id = props.id;
        this._nombre = props.nombre;
        this._descripcion = props.descripcion;
        this._ubicacion = props.ubicacion;
        this._deletedAt = props.deletedAt ?? null;
    }

    static crear(props: Omit<AlmacenPropiedades, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Almacen {
        if (!props.nombre?.trim()) throw new Error('El nombre del almacén es requerido');
        return new Almacen(props);
    }

    static reconstruir(props: Required<Pick<AlmacenPropiedades, 'id'>> & AlmacenPropiedades): Almacen {
        return new Almacen(props);
    }

    eliminar(): void {
        this._deletedAt = new Date();
    }

    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get descripcion() { return this._descripcion; }
    get ubicacion() { return this._ubicacion; }
    get deletedAt() { return this._deletedAt; }
}