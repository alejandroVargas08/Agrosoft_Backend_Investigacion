import { Inject, Injectable } from "@nestjs/common";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";

@Injectable()
export class listarCultivoUseCase{
    constructor(  @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort) {}
    async ejecutar(loteId: number) {
        return this.cultivoRepo.listarPorLote(loteId);
    } 
}