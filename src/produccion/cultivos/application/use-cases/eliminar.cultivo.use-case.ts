import { Inject, Injectable } from "@nestjs/common";
import { Cultivo_Repository, CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";

@Injectable()
export class eliminarCultivoUseCase{
    constructor(@Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort) {}

    async ejecutar(id: number) : Promise<void> {
        return this.cultivoRepo.eliminar(id);
    } 
}