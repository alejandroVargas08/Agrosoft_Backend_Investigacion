import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';
import { ActualizarTerrenoInput, geometriaDesde } from '../dto/actualizar-terreno.input';
import { LoteOutput, toLoteOutput } from '../dto/lote.dto';

@Injectable()
export class ActualizarLoteUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
    private readonly accesoLotes: AccesoLotesService,
) {}

async ejecutar(loteId: number, input: ActualizarTerrenoInput, alcance: AlcanceDatos): Promise<LoteOutput> {
    const lote = await this.accesoLotes.obtenerLoteVisible(loteId, alcance);
    try {
        lote.editar({ nombre: input.nombre, descripcion: input.descripcion, ...geometriaDesde(input) });
    } catch (error) {
        throw new BadRequestException(error instanceof Error ? error.message : 'Datos del lote no válidos');
    }
    const guardado = await this.loteRepository.guardar(lote);
    return toLoteOutput(guardado);
}
}
