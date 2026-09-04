import { Inject, Injectable } from '@nestjs/common';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';
import { SubLoteOutput, toSubLoteOutput } from '../dto/sublote.dto';

@Injectable()
export class ListarSubLotesPorLoteUseCase {
constructor(
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
) {}

async ejecutar(loteId: number): Promise<SubLoteOutput[]> {
    const subLotes = await this.subLoteRepository.buscarPorLoteId(loteId);
    return subLotes.map(toSubLoteOutput);
}
}