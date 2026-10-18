import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import { type actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { Actividades } from "../../domain/entities/actividades.entity";
import { AccesoActividadesService } from "../services/acceso-actividades.service";

@Injectable()
export class listarActividadesUseCase {
    constructor(
        @Inject(actividades_repository)
        private readonly actividadesRepository: actividadesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
    ) {}

    async execute(cultivoId: number, alcance: AlcanceDatos): Promise<Actividades[]> {
        await this.accesoActividades.validarCultivo(cultivoId, alcance);
        return await this.actividadesRepository.listarPorCultivo(cultivoId);
    }
}
