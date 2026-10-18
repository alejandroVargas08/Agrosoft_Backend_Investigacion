import { Inject, Injectable } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { SubLote } from '../../domain/entities/sublote.entity';
import { EstadoLote } from '../../domain/entities/lote.entity';
import { PoligonoGeografico } from '../../domain/value-objects/poligono-geografico.vo';
import { PuntoGeografico } from '../../domain/value-objects/punto-geografico.vo';
import { Area } from '../../domain/value-objects/area.vo';
import { SUBLOTE_REPOSITORY_PORT } from '../../domain/ports/sublote.repository.port';
import type { SubLoteRepositoryPort } from '../../domain/ports/sublote.repository.port';
import { AccesoLotesService } from '../services/acceso-lotes.service';
import { CrearSubLoteInput, SubLoteOutput, toSubLoteOutput } from '../dto/sublote.dto';

@Injectable()
export class CrearSubLoteUseCase {
constructor(
    @Inject(SUBLOTE_REPOSITORY_PORT)
    private readonly subLoteRepository: SubLoteRepositoryPort,
    private readonly accesoLotes: AccesoLotesService,
) {}

async ejecutar(input: CrearSubLoteInput, alcance: AlcanceDatos): Promise<SubLoteOutput> {
    await this.accesoLotes.obtenerLoteVisible(input.loteId, alcance);

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
