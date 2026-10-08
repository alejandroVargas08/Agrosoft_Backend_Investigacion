import { Inject, Injectable } from "@nestjs/common";
import { Incidencia_Repository } from "../../domain/ports/incidencia.repository.port";
import { type IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";

@Injectable()
export class ListarIncidenciasUseCase {
    constructor(
        @Inject(Incidencia_Repository) private readonly incidenciaRepo: IncidenciaRepositoryPort,
    ) {}

    async ejecutar(cultivoId?: number) {
        return this.incidenciaRepo.listar(cultivoId);
    }
}