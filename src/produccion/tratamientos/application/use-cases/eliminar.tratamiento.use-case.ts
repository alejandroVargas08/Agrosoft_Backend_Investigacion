import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import { type TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";

@Injectable()
export class EliminarTratamientoUseCase {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
    ) {}

    async ejecutar(id: number): Promise<void> {
        const tratamiento = await this.tratamientoRepo.buscarPorId(id);
        if (!tratamiento) throw new NotFoundException(`No existe el tratamiento con id ${id}`);

        await this.tratamientoRepo.eliminar(id);
    }
}