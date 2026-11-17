import { Injectable, Inject } from "@nestjs/common";
import { historial_CultivoRepository } from "../../domain/ports/historial-cultivo.port";
import { type HistorialCultivoRepositoryPort } from "../../domain/ports/historial-cultivo.port";
import { registrarHistorialCultivoDto } from "../dto/crear-historial-cultivo.dto";
import { historialCultivo } from "../../domain/entities/historial-cultivo.entity";

@Injectable()
    export class registrarCambioHistorialCultivoUseCase {
        constructor(
            @Inject(historial_CultivoRepository)
            private readonly historialCultivoRepository: HistorialCultivoRepositoryPort, 
        ) {}

        async execute(dto: registrarHistorialCultivoDto): Promise<historialCultivo> {
            const historial = new historialCultivo(
                null,
                dto.cultivoId,
                dto.usuarioId,
                dto.motivo,
                dto.cambios,
            );

            return await this.historialCultivoRepository.registrar(historial);
        }
    }