import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_evidenciaRepository } from "../../domain/ports/actividad-evidencias.repository.port";
import { type actividadEvidenciaRepositoryPort } from "../../domain/ports/actividad-evidencias.repository.port";

@Injectable()
    export class eliminarEvidenciaActividadUseCase {
        constructor(
            @Inject(actividad_evidenciaRepository)
            private readonly repo: actividadEvidenciaRepositoryPort
        ) {}

        async ejecutar(id: number): Promise<void> {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Evidencia ${id} no encontrada`);
            await this.repo.eliminar(id);
        }
    }