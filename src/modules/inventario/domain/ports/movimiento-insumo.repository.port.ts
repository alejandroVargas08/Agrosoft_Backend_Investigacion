import { MovimientoInsumo } from '../entities/movimiento-insumo.entity';

export interface MovimientoInsumoRepositoryPort {
    buscarPorId(id: number): Promise<MovimientoInsumo | null>;
    buscarPorInsumoId(insumoId: number): Promise<MovimientoInsumo[]>;
    guardar(movimiento: MovimientoInsumo): Promise<MovimientoInsumo>;
}

export const MOVIMIENTO_INSUMO_REPOSITORY_PORT = Symbol('MOVIMIENTO_INSUMO_REPOSITORY_PORT');