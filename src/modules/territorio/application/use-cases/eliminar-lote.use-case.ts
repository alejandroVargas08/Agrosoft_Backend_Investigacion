import { Inject, Injectable } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';

@Injectable()
export class EliminarLoteUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
    private readonly accesoLotes: AccesoLotesService,
) {}

async ejecutar(id: number, alcance: AlcanceDatos): Promise<void> {
    const lote = await this.accesoLotes.obtenerLoteVisible(id, alcance);

    lote.eliminar();
    await this.loteRepository.guardar(lote);
}
}
