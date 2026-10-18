import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AlcanceDatos } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { ACCESO_LOTES_PORT } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import type { AccesoLotesPort } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import { Cultivo } from '../../domain/entities/cultivo.entity';
import { Cultivo_Repository } from '../../domain/ports/cultivo.repository.port';
import type { CultivoRepositoryPort } from '../../domain/ports/cultivo.repository.port';

@Injectable()
export class AccesoCultivosService {
    constructor(
        @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort,
        @Inject(ACCESO_LOTES_PORT) private readonly accesoLotes: AccesoLotesPort,
    ) {}

    async validarLote(loteId: number, alcance: AlcanceDatos): Promise<void> {
        if (!(await this.accesoLotes.puedeAcceder(alcance, loteId))) {
            throw new NotFoundException(`Lote con ID ${loteId} no encontrado`);
        }
    }

    async idsAccesibles(alcance: AlcanceDatos): Promise<number[] | null> {
        const loteIds = await this.accesoLotes.idsAccesibles(alcance);
        if (loteIds === null) return null;
        return this.cultivoRepo.idsPorLotes(loteIds);
    }

    async puedeVerCultivo(cultivoId: number | null, alcance: AlcanceDatos): Promise<boolean> {
        if (cultivoId === null) return true;
        const cultivo = await this.cultivoRepo.buscarPorId(cultivoId);
        return cultivo !== null && (await this.accesoLotes.puedeAcceder(alcance, cultivo.loteId));
    }

    async obtenerCultivoVisible(id: number, alcance: AlcanceDatos): Promise<Cultivo> {
        const cultivo = await this.cultivoRepo.buscarPorId(id);
        if (!cultivo || !(await this.accesoLotes.puedeAcceder(alcance, cultivo.loteId))) {
            throw new NotFoundException(`Cultivo con ID ${id} no encontrado`);
        }
        return cultivo;
    }
}
