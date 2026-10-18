import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AlcanceDatos, ReglasAlcance } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { Lote } from '../../domain/entities/lote.entity';
import type { AccesoLotesPort } from '../../domain/ports/acceso-lotes.port';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';

@Injectable()
export class AccesoLotesService implements AccesoLotesPort {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
) {}

async puedeAcceder(alcance: AlcanceDatos, loteId: number): Promise<boolean> {
    const lote = await this.loteRepository.buscarPorId(loteId);
    return lote !== null && ReglasAlcance.puedeVerPrograma(alcance, lote.programaFormacionId);
}

async idsAccesibles(alcance: AlcanceDatos): Promise<number[] | null> {
    if (alcance.verTodo) return null;
    return this.loteRepository.idsVisibles(alcance.programasPermitidos);
}

async obtenerLoteVisible(loteId: number, alcance: AlcanceDatos): Promise<Lote> {
    const lote = await this.loteRepository.buscarPorId(loteId);
    if (!lote || !ReglasAlcance.puedeVerPrograma(alcance, lote.programaFormacionId)) {
        throw new NotFoundException(`Lote con id ${loteId} no encontrado`);
    }
    return lote;
}
}
