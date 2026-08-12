export interface ProveedorPropiedades {
    id?: number;
    nombre: string;
    deletedAt?: Date | null;
    }

    export class Proveedor {
    private _id?: number;
    private _nombre: string;
    private _deletedAt?: Date | null;

    private constructor(props: ProveedorPropiedades) {
        this._id = props.id;
        this._nombre = props.nombre;
        this._deletedAt = props.deletedAt ?? null;
    }

    static crear(props: Omit<ProveedorPropiedades, 'id' | 'deletedAt'>): Proveedor {
        if (!props.nombre?.trim()) throw new Error('El nombre del proveedor es requerido');
        return new Proveedor(props);
    }

    static reconstruir(props: Required<Pick<ProveedorPropiedades, 'id'>> & ProveedorPropiedades): Proveedor {
        return new Proveedor(props);
    }

    eliminar(): void {
        this._deletedAt = new Date();
    }

    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get deletedAt() { return this._deletedAt; }
}