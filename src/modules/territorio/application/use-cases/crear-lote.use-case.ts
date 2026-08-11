import { Inject, Injectable } from '@nestjs/common';
import { Lote, EstadoLote } from '../../domain/entities/lote.entity';
import { PoligonoGeografico } from '../../domain/value-objects/poligono-geografico.vo';
import { PuntoGeografico } from '../../domain/value-objects/punto-geografico.vo';
import { Area } from '../../domain/value-objects/area.vo';
import { LOTE_REPOSITORY_PORT } from '../../domain/ports/lote.repository.port';
import type { LoteRepositoryPort } from '../../domain/ports/lote.repository.port';
import { CrearLoteInput, LoteOutput, toLoteOutput } from '../dto/lote.dto';

@Injectable()
export class CrearLoteUseCase {
constructor(
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
) {}

async ejecutar(input: CrearLoteInput): Promise<LoteOutput> {
    const vertices = input.vertices.map((v) => PuntoGeografico.crear(v.lat, v.lng));

    const lote = Lote.crear({
        nombre: input.nombre,
        poligono: PoligonoGeografico.crear(vertices),
        centroide: PuntoGeografico.crear(input.centroide.lat, input.centroide.lng),
        area: Area.desdeM2(input.areaM2),
        descripcion: input.descripcion,
        estado: EstadoLote.ACTIVO,
    });

    const guardado = await this.loteRepository.guardar(lote);
    return toLoteOutput(guardado);
}
}