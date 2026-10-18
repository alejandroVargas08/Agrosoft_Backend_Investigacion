import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import { type actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { AccesoActividadesService } from "../services/acceso-actividades.service";

@Injectable()
export class eliminarActividadesUseCase {
    constructor(
        @Inject(actividades_repository)
        private readonly actividadesRepository: actividadesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
    ) {}

    async execute(id: number, alcance: AlcanceDatos): Promise<void> {
        await this.accesoActividades.obtenerActividadVisible(id, alcance);
        await this.actividadesRepository.eliminar(id);
    }
}
