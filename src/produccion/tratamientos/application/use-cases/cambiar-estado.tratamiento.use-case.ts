import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import { type TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";
import { EstadoTratamiento } from "../../domain/entities/tratamiento.entity";
import { AccesoTratamientosService } from "../services/acceso-tratamientos.service";

@Injectable()
export class CambiarEstadoTratamientoUseCase {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
        private readonly accesoTratamientos: AccesoTratamientosService,
    ) {}

    async ejecutar(id: number, nuevoEstado: EstadoTratamiento, alcance: AlcanceDatos) {
        const tratamiento = await this.accesoTratamientos.obtenerTratamientoVisible(id, alcance);
        try {
            tratamiento.cambiarEstado(nuevoEstado);
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }
        return this.tratamientoRepo.actualizar(tratamiento);
    }
}
