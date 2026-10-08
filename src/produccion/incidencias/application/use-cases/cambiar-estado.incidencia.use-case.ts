import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Incidencia_Repository } from "../../domain/ports/incidencia.repository.port";
import { type IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";
import { EstadoIncidencia } from "../../domain/entities/incidencia.entity";

@Injectable()
export class CambiarEstadoIncidenciaUseCase {
    constructor(
        @Inject(Incidencia_Repository) private readonly incidenciaRepo: IncidenciaRepositoryPort,
    ) {}

    async ejecutar(id: number, nuevoEstado: EstadoIncidencia) {
        const incidencia = await this.incidenciaRepo.buscarPorId(id);
        if (!incidencia) throw new NotFoundException(`No existe la incidencia con id ${id}`);

        incidencia.cambiarEstado(nuevoEstado);
        return this.incidenciaRepo.actualizar(incidencia);
    }
}