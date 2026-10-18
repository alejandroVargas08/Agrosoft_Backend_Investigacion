import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Incidencia_Repository } from "../../domain/ports/incidencia.repository.port";
import { type IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";
import { EstadoIncidencia } from "../../domain/entities/incidencia.entity";
import { AccesoIncidenciasService } from "../services/acceso-incidencias.service";

@Injectable()
export class CambiarEstadoIncidenciaUseCase {
    constructor(
        @Inject(Incidencia_Repository) private readonly incidenciaRepo: IncidenciaRepositoryPort,
        private readonly accesoIncidencias: AccesoIncidenciasService,
    ) {}

    async ejecutar(id: number, nuevoEstado: EstadoIncidencia, alcance: AlcanceDatos) {
        const incidencia = await this.accesoIncidencias.obtenerIncidenciaVisible(id, alcance);
        try {
            incidencia.cambiarEstado(nuevoEstado);
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }
        return this.incidenciaRepo.actualizar(incidencia);
    }
}
