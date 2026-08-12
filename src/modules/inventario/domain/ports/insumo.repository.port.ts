import { Insumo } from '../entities/insumo.entity';

export interface InsumoRepositoryPort {
    buscarPorId(id: number): Promise<Insumo | null>;
    buscarTodos(): Promise<Insumo[]>;
    buscarConStockBajoMinimo(): Promise<Insumo[]>;
    guardar(insumo: Insumo): Promise<Insumo>;
    existePorId(id: number): Promise<boolean>;
}

export const INSUMO_REPOSITORY_PORT = Symbol('INSUMO_REPOSITORY_PORT');