import { Inject, Injectable } from "@nestjs/common";
import { loteProduccion } from "../../domain/entities/lotes.produccion.entity";
import { lote_ProduccionRepository } from "../../domain/ports/lotes.produccion.repository.port";
import { type loteProduccionRepositoryPort } from "../../domain/ports/lotes.produccion.repository.port";
import { ActualizarLoteProduccionDto } from "../dtos/actualizar-lote.produccion.dto";

@Injectable()
export class ActualizarLoteProduccionUseCase {
    constructor(
        @Inject(lote_ProduccionRepository)
        private readonly loteProduccionRepo: loteProduccionRepositoryPort) {}

    async ejecutar(id: number, dto: ActualizarLoteProduccionDto): Promise<loteProduccion> {
        const loteExistente = await this.loteProduccionRepo.buscarPorId(id);
        if (!loteExistente) { throw new Error(`El lote de producción con id ${id} no fue encontrado`); }

        loteExistente.productoAgroId = dto.productoAgroId ?? loteExistente.productoAgroId;
        loteExistente.cultivoId = dto.cultivoId ?? loteExistente.cultivoId;
        loteExistente.loteId = dto.loteId ?? loteExistente.loteId;
        loteExistente.subLoteId = dto.subLoteId ?? loteExistente.subLoteId;
        loteExistente.actividadesCosechaId = dto.actividadesCosechaId ?? loteExistente.actividadesCosechaId;
        loteExistente.calidad = dto.calidad ?? loteExistente.calidad;
        loteExistente.cantidadKg = dto.cantidadKg ?? loteExistente.cantidadKg;
        loteExistente.stockDisponibleKg = dto.stockDisponibleKg ?? loteExistente.stockDisponibleKg;
        loteExistente.costoUnitarioKg = dto.costoUnitarioKg ?? loteExistente.costoUnitarioKg;
        loteExistente.costoTotal = dto.costoTotal ?? loteExistente.costoTotal;
        loteExistente.precioSugeridoKg = dto.precioSugeridoKg ?? loteExistente.precioSugeridoKg;

        loteExistente.recalcularCostoTotal();

        return this.loteProduccionRepo.actualizar(loteExistente);
    }
}