import { Inject, Injectable } from "@nestjs/common";
import { reservaActividadInsumoDto } from "../dto/reservar-actividad-insumo-reserva.dto";
import { actividadInsumoReserva } from "../../domain/entities/actividad-insumos-reserva.entity";
import { actividad_insumoReservaRepository } from "../../domain/ports/actividad-insumos-reserva.repository.ports";
import { type actividadInsumoReservaRepositoryPort } from "../../domain/ports/actividad-insumos-reserva.repository.ports";

@Injectable()
    export class reservarActividadInsumoReservaUseCase {
        constructor(
            @Inject(actividad_insumoReservaRepository)
            private readonly repo: actividadInsumoReservaRepositoryPort,
        ) {}

        async ejecutar(actividadId: number, dto: reservaActividadInsumoDto): Promise<actividadInsumoReserva> {
            const reserva = actividadInsumoReserva.crear({
                actividadId,
                insumoId: dto.insumoId,
                cantidadReservada: dto.cantidadReservada,
            });

            return this.repo.crear(reserva);
        }
    }