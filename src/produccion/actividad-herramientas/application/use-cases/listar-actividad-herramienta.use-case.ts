import { Inject, Injectable } from "@nestjs/common";
import { actividad_HerramientasRepository, actividad_HerramientasRepositoryPort } from "../../domain/ports/actividad-herramientas.repository.port";

@Injectable()
    export class listarActividadHerramientaUseCase {
        constructor(
            @Inject(actividad_HerramientasRepository)
            private readonly repo: actividad_HerramientasRepositoryPort
        ) {}

        async ejecutar(actividadId: number) {
            return this.repo.listarPorActividad(actividadId);
        }
    }