import { Inject, Injectable } from "@nestjs/common";
import { actividad_insumoReservaRepository, actividadInsumoReservaRepositoryPort } from "../../domain/ports/actividad-insumos-reserva.repository.ports";

@Injectable()
    export class listarActividadInsumoReservaUseCase {
        constructor(
            @Inject(actividad_insumoReservaRepository)
            private readonly repo: actividadInsumoReservaRepositoryPort,
        ) {}

        async ejecutar(actividadId: number) {
            return this.repo.listarActividad(actividadId);
        }
    }