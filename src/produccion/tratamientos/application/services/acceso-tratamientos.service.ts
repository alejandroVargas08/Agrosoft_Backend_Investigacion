import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { AccesoIncidenciasService } from "../../../incidencias/application/services/acceso-incidencias.service";
import { Tratamiento } from "../../domain/entities/tratamiento.entity";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import type { TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";

@Injectable()
export class AccesoTratamientosService {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
        private readonly accesoIncidencias: AccesoIncidenciasService,
    ) {}

    async obtenerTratamientoVisible(id: number, alcance: AlcanceDatos): Promise<Tratamiento> {
        const tratamiento = await this.tratamientoRepo.buscarPorId(id);
        if (!tratamiento || !(await this.accesoIncidencias.puedeVerIncidencia(tratamiento.incidenciaId, alcance))) {
            throw new NotFoundException(`No existe el tratamiento con id ${id}`);
        }
        return tratamiento;
    }
}
