import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import { type actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { Actividades, estadoActividad } from "../../domain/entities/actividades.entity";
import { AccesoActividadesService } from "../services/acceso-actividades.service";

@Injectable()
export class cambiarActividadesUseCase {
    constructor(
        @Inject(actividades_repository)
        private readonly actividadesRepository: actividadesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
    ) {}

    async execute(id: number, nuevoEstado: estadoActividad, alcance: AlcanceDatos): Promise<Actividades> {
        const actividades = await this.accesoActividades.obtenerActividadVisible(id, alcance);

        try {
            actividades.cambiarEstado(nuevoEstado);
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }

        return await this.actividadesRepository.actualizar(actividades);
    }
}
