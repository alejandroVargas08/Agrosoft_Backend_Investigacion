import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AlcanceDatos, ReglasAlcance } from '../../../iam/domain/value-objects/alcance-datos.vo';
import type { ProgramaFormacionRepositoryPort } from '../../../iam/domain/ports/programa-formacion.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../iam/domain/ports/programa-formacion.repository.token';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';
import { LoteOutput, toLoteOutput } from '../dto/lote.dto';

@Injectable()
export class AsignarProgramaLoteUseCase {
    constructor(
        @Inject(LOTE_REPOSITORY_PORT)
        private readonly loteRepository: LoteRepositoryPort,
        @Inject(PROGRAMA_FORMACION_REPOSITORY)
        private readonly programaRepository: ProgramaFormacionRepositoryPort,
        private readonly accesoLotes: AccesoLotesService,
    ) {}

    async ejecutar(loteId: number, programaFormacionId: number | null, alcance: AlcanceDatos): Promise<LoteOutput> {
        const lote = await this.accesoLotes.obtenerLoteVisible(loteId, alcance);

        if (programaFormacionId !== null) {
            if (!(await this.programaRepository.buscarPorId(programaFormacionId))) {
                throw new BadRequestException(`El programa de formación ${programaFormacionId} no existe`);
            }
        }
        if (!ReglasAlcance.puedeAsignarPrograma(alcance, programaFormacionId) || (programaFormacionId === null && !alcance.verTodo)) {
            throw new ForbiddenException('Solo puedes asignar el lote a una ficha que tienes a cargo');
        }

        try {
            lote.asignarProgramaFormacion(programaFormacionId);
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }

        return toLoteOutput(await this.loteRepository.guardar(lote));
    }
}
