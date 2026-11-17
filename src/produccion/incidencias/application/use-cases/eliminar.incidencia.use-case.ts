import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Incidencia_Repository } from "../../domain/ports/incidencia.repository.port";
import { type IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";
import { AccesoIncidenciasService } from "../services/acceso-incidencias.service";

@Injectable()
export class EliminarIncidenciaUseCase {
    constructor(
        @Inject(Incidencia_Repository) private readonly incidenciaRepo: IncidenciaRepositoryPort,
        private readonly accesoIncidencias: AccesoIncidenciasService,
    ) {}

    async ejecutar(id: number, alcance: AlcanceDatos): Promise<void> {
        await this.accesoIncidencias.obtenerIncidenciaVisible(id, alcance);
        await this.incidenciaRepo.eliminar(id);
    }
}
