import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';
import { CambiarEstadoSubLoteInput, SubLoteOutput, toSubLoteOutput } from '../dto/sublote.dto';

@Injectable()
export class CambiarEstadoSubLoteUseCase {
constructor(
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
    private readonly accesoLotes: AccesoLotesService,
) {}

async ejecutar(input: CambiarEstadoSubLoteInput, alcance: AlcanceDatos): Promise<SubLoteOutput> {
    const subLote = await this.subLoteRepository.buscarPorId(input.subLoteId);
    if (!subLote || !(await this.accesoLotes.puedeAcceder(alcance, subLote.loteId))) {
        throw new NotFoundException(`SubLote con id ${input.subLoteId} no encontrado`);
    }

    subLote.actualizarEstado(input.nuevoEstado);

    const actualizado = await this.subLoteRepository.guardar(subLote);
    return toSubLoteOutput(actualizado);
}
}
