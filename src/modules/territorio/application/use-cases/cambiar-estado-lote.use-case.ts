import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { CambiarEstadoLoteInput, LoteOutput, toLoteOutput } from '../dto/lote.dto';

@Injectable()
export class CambiarEstadoLoteUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
) {}

async ejecutar(input: CambiarEstadoLoteInput): Promise<LoteOutput> {
    const lote = await this.loteRepository.buscarPorId(input.loteId);
    if (!lote) {
        throw new NotFoundException(`Lote con id ${input.loteId} no encontrado`);
    }

    lote.actualizarEstado(input.nuevoEstado);

    const actualizado = await this.loteRepository.guardar(lote);
    return toLoteOutput(actualizado);
}
}