// --- Almacén ---
export interface CrearAlmacenInput {
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    }
    export interface AlmacenOutput {
    id: number;
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    }

    // --- Categoría ---
    export interface CrearCategoriaInput {
    nombre: string;
    descripcion?: string;
    tipoInsumo: string;
    }
    export interface CategoriaOutput {
    id: number;
    nombre: string;
    descripcion?: string;
    tipoInsumo: string;
    }

    // --- Proveedor ---
    export interface CrearProveedorInput {
    nombre: string;
    }
    export interface ProveedorOutput {
    id: number;
    nombre: string;
}