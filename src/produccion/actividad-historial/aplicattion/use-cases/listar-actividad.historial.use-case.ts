import { Inject, Injectable } from "@nestjs/common";
import { actividad_HistorialRepository, actividadHistorialRepositoryPort } from "../../domain/ports/actividad-historial.repository.port";
import { actividadHistorial } from "../../domain/entities/actividad-historial.entity";

@Injectable()
    export class listarActividadHistorialUseCase {
        constructor(
            @Inject(actividad_HistorialRepository) 
            private readonly historialRepo: actividadHistorialRepositoryPort,
        ) {}

        async ejecutar(actividadId: number): Promise<actividadHistorial[]> {
            return await this.historialRepo.listarActividad(actividadId);
        }
    }