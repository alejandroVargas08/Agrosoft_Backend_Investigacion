import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';

@Injectable()
export class EliminarLoteUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
) {}

async ejecutar(id: number): Promise<void> {
    const lote = await this.loteRepository.buscarPorId(id);
    if (!lote) {
    throw new NotFoundException(`Lote con id ${id} no encontrado`);
    }

    lote.eliminar();
    await this.loteRepository.guardar(lote);
}
}