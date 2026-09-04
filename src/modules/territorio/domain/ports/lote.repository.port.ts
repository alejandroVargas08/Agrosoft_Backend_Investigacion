import { Lote } from '../entities/lote.entity';

export interface LoteRepositoryPort {
    buscarPorId(id: number): Promise<Lote | null>;
    buscarTodos(): Promise<Lote[]>;
    guardar(lote: Lote): Promise<Lote>;
    eliminar(id: number): Promise<void>;
    existePorId(id: number): Promise<boolean>;
}

export const LOTE_REPOSITORY_PORT = Symbol('LOTE_REPOSITORY_PORT');