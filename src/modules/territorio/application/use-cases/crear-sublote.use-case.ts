import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubLote } from '../../domain/entities/sublote.entity';
import { EstadoLote } from '../../domain/entities/lote.entity';
import { PoligonoGeografico } from '../../domain/value-objects/poligono-geografico.vo';
import { PuntoGeografico } from '../../domain/value-objects/punto-geografico.vo';
import { Area } from '../../domain/value-objects/area.vo';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';
import { CrearSubLoteInput, SubLoteOutput, toSubLoteOutput } from '../dto/sublote.dto';

@Injectable()
export class CrearSubLoteUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
) {}

async ejecutar(input: CrearSubLoteInput): Promise<SubLoteOutput> {
    const existeLote = await this.loteRepository.existePorId(input.loteId);
    if (!existeLote) {
        throw new NotFoundException(`No existe el lote con id ${input.loteId}`);
    }

    const vertices = input.vertices.map((v) => PuntoGeografico.crear(v.lat, v.lng));

    const subLote = SubLote.crear({
        loteId: input.loteId,
        nombre: input.nombre,
        poligono: PoligonoGeografico.crear(vertices),
        centroide: PuntoGeografico.crear(input.centroide.lat, input.centroide.lng),
        area: Area.desdeM2(input.areaM2),
        descripcion: input.descripcion,
        estado: EstadoLote.ACTIVO,
    });

    const guardado = await this.subLoteRepository.guardar(subLote);
    return toSubLoteOutput(guardado);
}
}