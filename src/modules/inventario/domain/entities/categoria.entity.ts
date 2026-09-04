export interface CategoriaPropiedades {
    id?: number;
    nombre: string;
    descripcion?: string;
    tipoInsumo: string;
    deletedAt?: Date | null;
    }

    export class Categoria {
    private _id?: number;
    private _nombre: string;
    private _descripcion?: string;
    private _tipoInsumo: string;
    private _deletedAt?: Date | null;

    private constructor(props: CategoriaPropiedades) {
        this._id = props.id;
        this._nombre = props.nombre;
        this._descripcion = props.descripcion;
        this._tipoInsumo = props.tipoInsumo;
        this._deletedAt = props.deletedAt ?? null;
    }

    static crear(props: Omit<CategoriaPropiedades, 'id' | 'deletedAt'>): Categoria {
        if (!props.nombre?.trim()) throw new Error('El nombre de la categoría es requerido');
        return new Categoria(props);
    }

    static reconstruir(props: Required<Pick<CategoriaPropiedades, 'id'>> & CategoriaPropiedades): Categoria {
        return new Categoria(props);
    }

    eliminar(): void {
        this._deletedAt = new Date();
    }

    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get descripcion() { return this._descripcion; }
    get tipoInsumo() { return this._tipoInsumo; }
    get deletedAt() { return this._deletedAt; }
}