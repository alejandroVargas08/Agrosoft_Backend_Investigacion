import { Inject, Injectable } from "@nestjs/common";
import { actividad_evidenciaRepository, actividadEvidenciaRepositoryPort } from "../../domain/ports/actividad-evidencias.repository.port";

@Injectable()
    export class listarActividadEvidenciaUseCase {
        constructor(
            @Inject(actividad_evidenciaRepository)
            private readonly repo: actividadEvidenciaRepositoryPort
        ) {}

        async ejecutar(actividadId: number) {
            return this.repo.listarPorActividad(actividadId);
        }
    }