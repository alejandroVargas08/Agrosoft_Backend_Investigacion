import { Almacen } from '../entities/almacen.entity';

export interface AlmacenRepositoryPort {
    buscarPorId(id: number): Promise<Almacen | null>;
    buscarTodos(): Promise<Almacen[]>;
    guardar(almacen: Almacen): Promise<Almacen>;
    existePorId(id: number): Promise<boolean>;
    }

export const ALMACEN_REPOSITORY_PORT = Symbol('ALMACEN_REPOSITORY_PORT');