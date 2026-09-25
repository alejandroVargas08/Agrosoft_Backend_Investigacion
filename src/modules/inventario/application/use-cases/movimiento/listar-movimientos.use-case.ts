import { Inject, Injectable } from '@nestjs/common';
import { MOVIMIENTO_INSUMO_REPOSITORY_PORT } from '../../../domain/ports/movimiento-insumo.repository.port';
import type { MovimientoInsumoRepositoryPort } from '../../../domain/ports/movimiento-insumo.repository.port';
import { MovimientoOutput, toMovimientoOutput } from '../../dto/movimiento-insumo.dto';

@Injectable()
export class ListarMovimientosUseCase {
    constructor(
        @Inject(MOVIMIENTO_INSUMO_REPOSITORY_PORT)
        private readonly movimientoRepo: MovimientoInsumoRepositoryPort,
    ) {}

    async ejecutar(): Promise<MovimientoOutput[]> {
        const movimientos = await this.movimientoRepo.buscarTodos();
        return movimientos.map(toMovimientoOutput);
    }
}