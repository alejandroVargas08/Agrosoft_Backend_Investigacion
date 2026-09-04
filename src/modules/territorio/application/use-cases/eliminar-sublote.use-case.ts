import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';

@Injectable()
export class EliminarSubLoteUseCase {
constructor(
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
) {}

async ejecutar(id: number): Promise<void> {
    const subLote = await this.subLoteRepository.buscarPorId(id);
    if (!subLote) {
        throw new NotFoundException(`SubLote con id ${id} no encontrado`);
    }

    subLote.eliminar();
    await this.subLoteRepository.guardar(subLote);
}
}