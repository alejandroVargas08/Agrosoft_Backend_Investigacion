import { Inject, Injectable } from "@nestjs/common";
import { actividad_InsumoRepository, actividadInsumoRepositoryPort } from "../../domain/port/actividad-insumo.repository.port";

@Injectable()
    export class listarActividadInsumosUseCase {
        constructor(
            @Inject(actividad_InsumoRepository)
            private readonly repo: actividadInsumoRepositoryPort 
        ) {}

        async ejecutar(actividadId: number) {
            return this.repo.listarPorActividad(actividadId);
        }
    }