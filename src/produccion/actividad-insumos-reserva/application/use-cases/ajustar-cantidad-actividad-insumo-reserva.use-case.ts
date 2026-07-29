import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_insumoReservaRepository, actividadInsumoReservaRepositoryPort } from "../../domain/ports/actividad-insumos-reserva.repository.ports";

@Injectable()
    export class ajustarCantidadActividadInsumoReservaUseCase {
        constructor(
            @Inject(actividad_insumoReservaRepository)
            private readonly repo: actividadInsumoReservaRepositoryPort,
        ) {}

        async ejecutar(id: number, cantidadReserva: number) {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Reserva ${id} no encontrada`);
            item.ajustarCantidad(cantidadReserva);
            return this.repo.actualizar(item);
        }
    }