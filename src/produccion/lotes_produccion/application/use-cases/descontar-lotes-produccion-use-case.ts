import { Inject, Injectable } from "@nestjs/common";
import { loteProduccion } from "../../domain/entities/lotes.produccion.entity";
import { lote_ProduccionRepository } from "../../domain/ports/lotes.produccion.repository.port";
import { type loteProduccionRepositoryPort } from "../../domain/ports/lotes.produccion.repository.port";

@Injectable()
    export class descontarStockUseCase {
        constructor(
            @Inject(lote_ProduccionRepository)
            private readonly loteproduccionRepository: loteProduccionRepositoryPort,
        ) {}

        async ejecutar(id: number, cantidadKg: number): Promise<loteProduccion> {
            const lote = await this.loteproduccionRepository.buscarPorId(id);
            if(!lote) {
                throw new Error('Lote de produccion no encontrado');
            }

            lote.descontarStock(cantidadKg);
            return await this.loteproduccionRepository.actualizar(lote);
        }
    }