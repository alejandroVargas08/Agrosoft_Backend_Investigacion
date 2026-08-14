import { Inject } from "@nestjs/common";
import { loteProduccion } from "../../domain/entities/lotes.produccion.entity";
import { lote_ProduccionRepository } from "../../domain/ports/lotes.produccion.repository.port";
import { type loteProduccionRepositoryPort } from "../../domain/ports/lotes.produccion.repository.port";
import { CrearLoteProduccionDto } from "../dtos/crear-lote.produccion.dto";

export class CrearLoteProduccionUseCase {
    constructor(
        @Inject(lote_ProduccionRepository)
        private readonly loteProduccionRepo: loteProduccionRepositoryPort) {}

    async ejecutar(dto: CrearLoteProduccionDto): Promise<loteProduccion> {
        const nuevoLote = new loteProduccion(
            null,
            dto.productoAgroId,
            dto.cultivoId,
            dto.loteId,
            dto.subLoteId ?? null,
            dto.actividadesCosechaId ?? null,
            dto.calidad,
            dto.cantidadKg,
            dto.stockDisponibleKg,
            dto.costoUnitarioKg,
            dto.costoTotal,
            dto.precioSugeridoKg,
        );
        nuevoLote.recalcularCostoTotal();
        return this.loteProduccionRepo.crear(nuevoLote);
    }
}