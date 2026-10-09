import { Inject, Injectable } from "@nestjs/common";
import { Tratamiento } from "../../domain/entities/tratamiento.entity";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import { type TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";
import { CrearTratamientoDto } from "../dtos/crear-tratamiento.dto";

@Injectable()
export class CrearTratamientoUseCase {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
    ) {}

    async ejecutar(dto: CrearTratamientoDto): Promise<Tratamiento> {
        const tratamiento = new Tratamiento(
            null,
            dto.incidenciaId ?? null,
            dto.producto,
            dto.dosis ?? null,
            dto.fecha ? new Date(dto.fecha) : new Date(),
            dto.costo ?? 0,
            dto.notas ?? null,
            'scheduled',
        );
        return this.tratamientoRepo.crear(tratamiento);
    }
}