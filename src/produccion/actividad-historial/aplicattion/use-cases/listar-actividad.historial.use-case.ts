import { Inject, Injectable } from "@nestjs/common";
import { actividadHistorial } from "../../domain/entities/actividad-historial.entity";
import { actividad_HistorialRepository } from "../../domain/ports/actividad-historial.repository.port";
import { type actividadHistorialRepositoryPort } from "../../domain/ports/actividad-historial.repository.port";

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