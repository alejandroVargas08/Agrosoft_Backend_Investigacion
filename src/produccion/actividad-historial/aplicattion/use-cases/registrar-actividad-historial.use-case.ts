import { Inject, Injectable } from "@nestjs/common";
import { actividad_HistorialRepository, actividadHistorialRepositoryPort } from "../../domain/ports/actividad-historial.repository.port";
import { crearActividadHistorialDto } from "../dto/crear-actividad-historial.dto";
import { actividadHistorial } from "../../domain/entities/actividad-historial.entity";

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