import { Inject, Injectable } from "@nestjs/common";
import { loteProduccion } from "../../domain/entities/lotes.produccion.entity";
import { lote_ProduccionRepository, loteProduccionRepositoryPort } from "../../domain/ports/lotes.produccion.repository.port";

@Injectable()
export class listarLotesProduccionUseCase {
    constructor( 
        @Inject(lote_ProduccionRepository)
        private readonly loteProduccionRepo: loteProduccionRepositoryPort) {}

    async ejecutar(cultivoId?: number): Promise<loteProduccion[]> {
        if(cultivoId) {
            return this.loteProduccionRepo.listarPorCultivo(cultivoId);
        }
        return this.loteProduccionRepo.listarTodos();
    }
}