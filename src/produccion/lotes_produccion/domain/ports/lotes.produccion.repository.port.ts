import { loteProduccion } from "../entities/lotes.produccion.entity";

export const lote_ProduccionRepository = Symbol('Lote_ProduccionRepository');

export interface loteProduccionRepositoryPort {
    crear(loteProduccion: loteProduccion): Promise<loteProduccion>;
    buscarPorId(id: number): Promise<loteProduccion | null>;
    listarTodos(): Promise<loteProduccion[]>;
    listarPorCultivo(cultivoId: number): Promise<loteProduccion[]>;
    actualizar(loteProduccion: loteProduccion): Promise<loteProduccion>;
    eliminar(id: number): Promise<void>;
}