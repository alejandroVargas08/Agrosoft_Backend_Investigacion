import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Incidencia_Repository } from "../../domain/ports/incidencia.repository.port";
import { type IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";

@Injectable()
export class EliminarIncidenciaUseCase {
    constructor(
        @Inject(Incidencia_Repository) private readonly incidenciaRepo: IncidenciaRepositoryPort,
    ) {}

    async ejecutar(id: number): Promise<void> {
        const incidencia = await this.incidenciaRepo.buscarPorId(id);
        if (!incidencia) throw new NotFoundException(`No existe la incidencia con id ${id}`);

        await this.incidenciaRepo.eliminar(id);
    }
}