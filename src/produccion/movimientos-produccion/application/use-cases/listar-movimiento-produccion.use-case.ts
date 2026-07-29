import { Inject, Injectable } from "@nestjs/common";
import { movimiento_ProduccionRepository, movimientoProduccionRepositoryPort } from "../../domain/ports/movimiento-produccion.repository.port";

@Injectable()
    export class listarMovimientoProduccionUseCase {
        constructor(
            @Inject(movimiento_ProduccionRepository)
        private readonly repo: movimientoProduccionRepositoryPort,
        ) {}

        async ejecutar(loteProduccionId: number) {
            return this.repo.listarLoteProduccion(loteProduccionId);
        }
    } 