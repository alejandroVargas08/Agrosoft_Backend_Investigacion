import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import { type TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";
import { AccesoTratamientosService } from "../services/acceso-tratamientos.service";

@Injectable()
export class EliminarTratamientoUseCase {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
        private readonly accesoTratamientos: AccesoTratamientosService,
    ) {}

    async ejecutar(id: number, alcance: AlcanceDatos): Promise<void> {
        await this.accesoTratamientos.obtenerTratamientoVisible(id, alcance);
        await this.tratamientoRepo.eliminar(id);
    }
}
