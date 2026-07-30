import { Inject, Injectable } from "@nestjs/common";
import { actividad_ResponsableRepository } from "../../domain/ports/actividad-responsable.port";
import { type actividadResponsableRepositoryPort } from "../../domain/ports/actividad-responsable.port";

@Injectable()
    export class listarActividadResponsablesUseCase {
        constructor(
            @Inject(actividad_ResponsableRepository)
            private readonly repo: actividadResponsableRepositoryPort
        ) {}

        async ejecutar(actividadId: number) {
            return this.repo.listarPorActividad(actividadId);
        }
    }