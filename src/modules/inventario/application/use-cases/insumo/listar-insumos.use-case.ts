import { Inject, Injectable } from '@nestjs/common';
import { INSUMO_REPOSITORY_PORT } from '../../../domain/ports/insumo.repository.port';
import type { InsumoRepositoryPort } from '../../../domain/ports/insumo.repository.port';
import { InsumoOutput, toInsumoOutput } from '../../dto/insumo.dto';

@Injectable()
export class ListarInsumosUseCase {
    constructor(
        @Inject(INSUMO_REPOSITORY_PORT) private readonly insumoRepo: InsumoRepositoryPort,
    ) {}

    async ejecutar(): Promise<InsumoOutput[]> {
        const insumos = await this.insumoRepo.buscarTodos();
        return insumos.map(toInsumoOutput);
    }
}