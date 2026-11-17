import { Inject, Injectable } from "@nestjs/common";
import { uso_HerramientaRepository } from "../../domain/ports/uso-herramienta.repository.port";
import { type usoHerramientaRepositoryPort } from "../../domain/ports/uso-herramienta.repository.port";

@Injectable()
    export class listarUsoHerramientasUseCase {
        constructor(
            @Inject(uso_HerramientaRepository)
            private readonly repo: usoHerramientaRepositoryPort,
        ) {}

        async ejecutar(actividadId: number) {
            return this.repo.listarPorActividad(actividadId);
        }
    }