import { Inject, Injectable } from "@nestjs/common";
import { historial_CultivoRepository, HistorialCultivoRepositoryPort } from "../../domain/ports/historial-cultivo.port";
import { historialCultivo } from "../../domain/entities/historial-cultivo.entity";

@Injectable()
export class listarHistorialCultivoUseCase {
    constructor(
        @Inject(historial_CultivoRepository)
        private readonly historialCultivoRepository: HistorialCultivoRepositoryPort,
    ) {}

    async execute(cultivoId: number): Promise<historialCultivo[]> {
        return await this.historialCultivoRepository.listarPorCultivo(cultivoId);
    }
}