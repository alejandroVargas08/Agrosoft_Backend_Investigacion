import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { AccesoIncidenciasService } from "../../../incidencias/application/services/acceso-incidencias.service";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import { type TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";

@Injectable()
export class ListarTratamientosUseCase {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
        private readonly accesoIncidencias: AccesoIncidenciasService,
    ) {}

    async ejecutar(alcance: AlcanceDatos, incidenciaId?: number) {
        const incidenciaIds = await this.accesoIncidencias.idsAccesibles(alcance);
        return this.tratamientoRepo.listarVisibles(incidenciaIds, incidenciaId);
    }
}
