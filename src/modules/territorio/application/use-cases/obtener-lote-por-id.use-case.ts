import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { LoteOutput, toLoteOutput } from '../dto/lote.dto';

@Injectable()
export class ObtenerLotePorIdUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
) {}

async ejecutar(id: number): Promise<LoteOutput> {
    const lote = await this.loteRepository.buscarPorId(id);
    if (!lote) {
        throw new NotFoundException(`Lote con id ${id} no encontrado`);
    }
    return toLoteOutput(lote);
}
}