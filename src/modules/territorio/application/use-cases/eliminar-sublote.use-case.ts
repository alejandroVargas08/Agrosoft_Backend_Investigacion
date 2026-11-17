import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';

@Injectable()
export class EliminarSubLoteUseCase {
constructor(
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
    private readonly accesoLotes: AccesoLotesService,
) {}

async ejecutar(id: number, alcance: AlcanceDatos): Promise<void> {
    const subLote = await this.subLoteRepository.buscarPorId(id);
    if (!subLote || !(await this.accesoLotes.puedeAcceder(alcance, subLote.loteId))) {
        throw new NotFoundException(`SubLote con id ${id} no encontrado`);
    }

    subLote.eliminar();
    await this.subLoteRepository.guardar(subLote);
}
}
