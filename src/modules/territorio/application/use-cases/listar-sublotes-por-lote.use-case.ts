import { Inject, Injectable } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';
import { SubLoteOutput, toSubLoteOutput } from '../dto/sublote.dto';

@Injectable()
export class ListarSubLotesPorLoteUseCase {
constructor(
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
    private readonly accesoLotes: AccesoLotesService,
) {}

async ejecutar(loteId: number, alcance: AlcanceDatos): Promise<SubLoteOutput[]> {
    await this.accesoLotes.obtenerLoteVisible(loteId, alcance);
    const subLotes = await this.subLoteRepository.buscarPorLoteId(loteId);
    return subLotes.map(toSubLoteOutput);
}
}
