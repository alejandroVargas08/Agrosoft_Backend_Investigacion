import { CodigoVinculacion } from '../entities/codigo-vinculacion.entity';

export interface CodigoVinculacionRepositoryPort {
    guardar(codigo: CodigoVinculacion): Promise<CodigoVinculacion>;
    buscarPorCodigo(codigo: string): Promise<CodigoVinculacion | null>;
    marcarUsado(id: number): Promise<void>;
    /** Invalida los codigos que el usuario haya pedido antes y no haya usado */
    invalidarPendientesDe(usuarioId: number): Promise<void>;
}

export const CODIGO_VINCULACION_REPOSITORY_PORT = Symbol('CODIGO_VINCULACION_REPOSITORY_PORT');
