import { movimientoProduccion } from "../entities/movimiento-produccion.entity";

export const movimiento_ProduccionRepository = Symbol('movimiento_ProduccionRepository');
    export interface movimientoProduccionRepositoryPort {
        crear(item: movimientoProduccion): Promise<movimientoProduccion>;
        listarLoteProduccion(loteProduccionId: number): Promise<movimientoProduccion[]>;
    }