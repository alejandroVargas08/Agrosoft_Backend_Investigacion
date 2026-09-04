import { Proveedor } from '../entities/proveedor.entity';

export interface ProveedorRepositoryPort {
    buscarPorId(id: number): Promise<Proveedor | null>;
    buscarTodos(): Promise<Proveedor[]>;
    guardar(proveedor: Proveedor): Promise<Proveedor>;
    existePorId(id: number): Promise<boolean>;
}

export const PROVEEDOR_REPOSITORY_PORT = Symbol('PROVEEDOR_REPOSITORY_PORT');