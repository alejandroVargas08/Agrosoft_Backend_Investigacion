import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";

@Injectable()
export class ObtenerCultivoUseCase {
    constructor(
        @Inject(Cultivo_Repository) 
        private readonly cultivoRepo: CultivoRepositoryPort
    ) {}

    async ejecutar(id: number): Promise<Cultivo> {
        const cultivo = await this.cultivoRepo.buscarPorId(id);
        if (!cultivo) {
            throw new NotFoundException(`Cultivo con ID ${id} no encontrado`);
        }
        return cultivo;
    }
}