import { SubLote } from '../entities/sublote.entity';

export interface SubLoteRepositoryPort {
    buscarPorId(id: number): Promise<SubLote | null>;
    buscarPorLoteId(loteId: number): Promise<SubLote[]>;
    guardar(subLote: SubLote): Promise<SubLote>;
    eliminar(id: number): Promise<void>;
}

export const SUBLOTE_REPOSITORY_PORT = Symbol('SUBLOTE_REPOSITORY_PORT');