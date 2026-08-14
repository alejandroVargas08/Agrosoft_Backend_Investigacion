import { Inject, Injectable } from "@nestjs/common";
import { crearActividadHistorialDto } from "../dto/crear-actividad-historial.dto";
import { actividadHistorial } from "../../domain/entities/actividad-historial.entity";
import { actividad_HistorialRepository } from "../../domain/ports/actividad-historial.repository.port";
import { type actividadHistorialRepositoryPort } from "../../domain/ports/actividad-historial.repository.port";

@Injectable()
    export class registrarActividadHistorialUseCase {
        constructor(
            @Inject(actividad_HistorialRepository)
            private readonly actividadhistorialRepository: actividadHistorialRepositoryPort,
        ) {}

        async ejecutar(dto: crearActividadHistorialDto): Promise<actividadHistorial> {
            const registro = actividadHistorial.crear(dto);
            return await this.actividadhistorialRepository.crear(registro);
        }
    }