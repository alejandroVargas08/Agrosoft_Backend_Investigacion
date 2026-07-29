import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_insumoReservaRepository, actividadInsumoReservaRepositoryPort } from "../../domain/ports/actividad-insumos-reserva.repository.ports";

@Injectable()
    export class liberarActividadInsumoReservaUseCase {
        constructor(
            @Inject(actividad_insumoReservaRepository)
            private readonly repo: actividadInsumoReservaRepositoryPort
        ) {}

        async ejecutar(id: number): Promise<void> {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Reserva ${id} no encontrada`);
            await this.repo.eliminar(id);
        }
    }