import { Inject, Injectable } from "@nestjs/common";
import { actividad_InsumoUsoRepository, actividadInsumoUsoRepositoryPort } from "../../domain/ports/actividad-insumos-uso.repository.port";

@Injectable()
    export class listarActividadInsumoUsoUseCase {
        constructor(
            @Inject(actividad_InsumoUsoRepository)
            private readonly repo: actividadInsumoUsoRepositoryPort
        ) {}

        async ejecutar(activdadId: number) {
            return this.repo.listarActividad(activdadId);
        }
    }