import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_insumoReservaRepository } from "../../domain/ports/actividad-insumos-reserva.repository.ports";
import { type actividadInsumoReservaRepositoryPort } from "../../domain/ports/actividad-insumos-reserva.repository.ports";

@Injectable()
    export class ajustarCantidadActividadInsumoReservaUseCase {
        constructor(
            @Inject(actividad_insumoReservaRepository)
            private readonly repo: actividadInsumoReservaRepositoryPort,
        ) {}

        async ejecutar(id: number, cantidadReserva: number, actividadId?: number) {
            const item = await this.repo.buscarPorId(id);
            if (!item || (actividadId !== undefined && item.actividadId !== actividadId)) throw new NotFoundException(`Reserva ${id} no encontrada`);
            item.ajustarCantidad(cantidadReserva);
            return this.repo.actualizar(item);
        }
    }
