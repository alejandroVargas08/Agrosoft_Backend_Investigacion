import { Reserva } from '../entities/reserva.entity';

export interface ReservaRepositoryPort {
    buscarPorId(id: number): Promise<Reserva | null>;
    buscarPorInsumoId(insumoId: number): Promise<Reserva[]>;
    guardar(reserva: Reserva): Promise<Reserva>;
}

export const RESERVA_REPOSITORY_PORT = Symbol('RESERVA_REPOSITORY_PORT');