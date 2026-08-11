import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';
import { CambiarEstadoSubLoteInput, SubLoteOutput, toSubLoteOutput } from '../dto/sublote.dto';

@Injectable()
export class CambiarEstadoSubLoteUseCase {
constructor(
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
) {}

async ejecutar(input: CambiarEstadoSubLoteInput): Promise<SubLoteOutput> {
    const subLote = await this.subLoteRepository.buscarPorId(input.subLoteId);
    if (!subLote) {
        throw new NotFoundException(`SubLote con id ${input.subLoteId} no encontrado`);
    }

    subLote.actualizarEstado(input.nuevoEstado);

    const actualizado = await this.subLoteRepository.guardar(subLote);
    return toSubLoteOutput(actualizado);
}
}