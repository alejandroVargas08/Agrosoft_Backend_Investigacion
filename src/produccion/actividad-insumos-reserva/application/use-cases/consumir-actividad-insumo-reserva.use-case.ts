import { Inject, Injectable } from "@nestjs/common";
import { actividad_insumoReservaRepository, actividadInsumoReservaRepositoryPort } from "../../domain/ports/actividad-insumos-reserva.repository.ports";

@Injectable()
    export class consumirActividadInsumoReservaUseCase {
        constructor(
            @Inject(actividad_insumoReservaRepository)
            private readonly repo: actividadInsumoReservaRepositoryPort,
        ) {}

        async ejecutar(actividadId: number, insumoId: number, cantidad: number): Promise<void> {
            const reserva = await this.repo.buscarActividadInsumoReserva(actividadId, insumoId);
            if(!reserva) return;

            const quedoEnCero = reserva.consumir(cantidad);
            if(quedoEnCero) {
                await this.repo.eliminar(reserva.id!);
            } else {
                await this.repo.actualizar(reserva);
            }
        }
    }