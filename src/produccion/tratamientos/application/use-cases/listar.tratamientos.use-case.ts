import { Inject, Injectable } from "@nestjs/common";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import { type TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";

@Injectable()
export class ListarTratamientosUseCase {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
    ) {}

    async ejecutar(incidenciaId?: number) {
        return this.tratamientoRepo.listar(incidenciaId);
    }
}