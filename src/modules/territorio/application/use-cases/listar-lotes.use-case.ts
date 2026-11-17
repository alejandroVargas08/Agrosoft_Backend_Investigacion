import { Inject, Injectable } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { LoteOutput, toLoteOutput } from '../dto/lote.dto';

@Injectable()
export class ListarLotesUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
) {}

async ejecutar(alcance: AlcanceDatos): Promise<LoteOutput[]> {
    const lotes = await this.loteRepository.buscarVisibles(alcance.verTodo ? null : alcance.programasPermitidos);
    return lotes.map(toLoteOutput);
}
}
