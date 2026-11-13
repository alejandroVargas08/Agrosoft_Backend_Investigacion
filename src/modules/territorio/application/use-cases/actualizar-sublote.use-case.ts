import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';
import { ActualizarTerrenoInput, geometriaDesde } from '../dto/actualizar-terreno.input';
import { SubLoteOutput, toSubLoteOutput } from '../dto/sublote.dto';

@Injectable()
export class ActualizarSubLoteUseCase {
constructor(
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
    private readonly accesoLotes: AccesoLotesService,
) {}

async ejecutar(subLoteId: number, input: ActualizarTerrenoInput, alcance: AlcanceDatos): Promise<SubLoteOutput> {
    const subLote = await this.subLoteRepository.buscarPorId(subLoteId);
    if (!subLote || !(await this.accesoLotes.puedeAcceder(alcance, subLote.loteId))) {
        throw new NotFoundException(`SubLote con id ${subLoteId} no encontrado`);
    }
    try {
        subLote.editar({ nombre: input.nombre, descripcion: input.descripcion, ...geometriaDesde(input) });
    } catch (error) {
        throw new BadRequestException(error instanceof Error ? error.message : 'Datos del sublote no válidos');
    }
    const guardado = await this.subLoteRepository.guardar(subLote);
    return toSubLoteOutput(guardado);
}
}
