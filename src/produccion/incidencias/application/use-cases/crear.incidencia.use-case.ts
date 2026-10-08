import { Inject, Injectable } from "@nestjs/common";
import { Incidencia } from "../../domain/entities/incidencia.entity";
import { Incidencia_Repository } from "../../domain/ports/incidencia.repository.port";
import { type IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";
import { CrearIncidenciaDto } from "../dtos/crear-incidencia.dto";

@Injectable()
export class CrearIncidenciaUseCase {
    constructor(
        @Inject(Incidencia_Repository) private readonly incidenciaRepo: IncidenciaRepositoryPort,
    ) {}

    async ejecutar(dto: CrearIncidenciaDto): Promise<Incidencia> {
        const incidencia = new Incidencia(
            null,
            dto.titulo,
            dto.tipo,
            dto.severidad,
            'open',
            dto.cultivoId ?? null,
            dto.fecha ? new Date(dto.fecha) : new Date(),
            dto.descripcion ?? null,
        );
        return this.incidenciaRepo.crear(incidencia);
    }
}