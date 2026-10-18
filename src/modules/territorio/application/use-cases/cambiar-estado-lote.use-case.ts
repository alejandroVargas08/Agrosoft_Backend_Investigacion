import { Inject, Injectable } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';
import { CambiarEstadoLoteInput, LoteOutput, toLoteOutput } from '../dto/lote.dto';

@Injectable()
export class CambiarEstadoLoteUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
    private readonly accesoLotes: AccesoLotesService,
) {}

async ejecutar(input: CambiarEstadoLoteInput, alcance: AlcanceDatos): Promise<LoteOutput> {
    const lote = await this.accesoLotes.obtenerLoteVisible(input.loteId, alcance);

    lote.actualizarEstado(input.nuevoEstado);

    const actualizado = await this.loteRepository.guardar(lote);
    return toLoteOutput(actualizado);
}
}
