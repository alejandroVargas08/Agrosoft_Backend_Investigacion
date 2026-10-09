import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import { type TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";
import { EstadoTratamiento } from "../../domain/entities/tratamiento.entity";

@Injectable()
export class CambiarEstadoTratamientoUseCase {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
    ) {}

    async ejecutar(id: number, nuevoEstado: EstadoTratamiento) {
        const tratamiento = await this.tratamientoRepo.buscarPorId(id);
        if (!tratamiento) throw new NotFoundException(`No existe el tratamiento con id ${id}`);

        tratamiento.cambiarEstado(nuevoEstado);
        return this.tratamientoRepo.actualizar(tratamiento);
    }
}