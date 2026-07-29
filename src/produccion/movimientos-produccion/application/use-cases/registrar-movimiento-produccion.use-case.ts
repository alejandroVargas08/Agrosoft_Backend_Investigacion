import { Inject, Injectable } from "@nestjs/common";
import { movimientoProduccion } from "../../domain/entities/movimiento-produccion.entity";
import { movimiento_ProduccionRepository, movimientoProduccionRepositoryPort } from "../../domain/ports/movimiento-produccion.repository.port";
import { registrarMovimientoProduccionDto } from "../dto/registrar-movimiento-produccion.dto";

@Injectable()
    export class registrarMovimientoProduccionUseCase {
        constructor(
            @Inject(movimiento_ProduccionRepository)
            private readonly repo: movimientoProduccionRepositoryPort,
        ) {}

        async ejecutar(loteProduccionId: number, dto: registrarMovimientoProduccionDto): Promise<movimientoProduccion> {
            const movimiento = movimientoProduccion.crear({
                loteProduccionId, 
                tipo: dto.tipo, 
                cantidadKg: dto.cantidadKg,
                costoUnitarioKg: dto.costoUnitarioKg, 
                precioUnitarioKg: dto.precioUnitarioKg,
                ventaId: dto.ventaId, 
                descripcion: dto.descripcion, 
                usuarioId: dto.usuarioId,
            });

            return this.repo.crear(movimiento);
        }
    }