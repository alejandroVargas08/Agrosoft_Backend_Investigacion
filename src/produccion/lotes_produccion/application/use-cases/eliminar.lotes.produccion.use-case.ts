import { Inject, Injectable } from "@nestjs/common";
import { lote_ProduccionRepository, loteProduccionRepositoryPort } from "../../domain/ports/lotes.produccion.repository.port";

@Injectable()
export class eliminarLoteProduccionUseCase{
    constructor( 
        @Inject(lote_ProduccionRepository)
        private readonly loteProduccionRepo: loteProduccionRepositoryPort) {}

    async ejecutar(id: number) : Promise<void> {
        const loteExistente = await this.loteProduccionRepo.buscarPorId(id);
        if (!loteExistente) { throw new Error(`El lote de producción con id ${id} no fue encontrado`); }

        return this.loteProduccionRepo.eliminar(id);
    }
}