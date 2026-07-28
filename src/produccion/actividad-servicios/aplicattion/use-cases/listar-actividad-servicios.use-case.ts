import { Inject, Injectable } from "@nestjs/common";
import { actividad_ServicioRepository, actividadServicioRepositoryPort } from "../../domain/ports/actividad-servicios.repository.port";

@Injectable()
    export class listarActividadServicioUseCase {
        constructor(
            @Inject(actividad_ServicioRepository)
            private readonly repo: actividadServicioRepositoryPort
        ) {}

        async ejecutar(actividadId: number) {
            return this.repo.listarPorActividad(actividadId);
        }
    }