import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MovimientoInsumo, TipoMovimiento } from '../../../domain/entities/movimiento-insumo.entity';
import { MOVIMIENTO_INSUMO_REPOSITORY_PORT } from '../../../domain/ports/movimiento-insumo.repository.port';
import type { MovimientoInsumoRepositoryPort } from '../../../domain/ports/movimiento-insumo.repository.port';
import { INSUMO_REPOSITORY_PORT } from '../../../domain/ports/insumo.repository.port';
import type { InsumoRepositoryPort } from '../../../domain/ports/insumo.repository.port';
import { RegistrarMovimientoInput, MovimientoOutput } from '../../dto/movimiento-insumo.dto';

@Injectable()
export class RegistrarMovimientoInsumoUseCase {
    constructor(
        @Inject(INSUMO_REPOSITORY_PORT) private readonly insumoRepo: InsumoRepositoryPort,
        @Inject(MOVIMIENTO_INSUMO_REPOSITORY_PORT)
        private readonly movimientoRepo: MovimientoInsumoRepositoryPort,
    ) {}

    async ejecutar(input: RegistrarMovimientoInput): Promise<MovimientoOutput> {
        const insumo = await this.insumoRepo.buscarPorId(input.insumoId);
        if (!insumo) throw new NotFoundException(`No existe el insumo con id ${input.insumoId}`);

        if (input.tipo === TipoMovimiento.SALIDA || input.tipo === TipoMovimiento.TRASLADO) {
        insumo.descontarStock(input.cantidadUso, input.cantidadPresentacion);
        } else if (input.tipo === TipoMovimiento.ENTRADA) {
        insumo.agregarStock(input.cantidadUso, input.cantidadPresentacion);
        }

        const movimiento = MovimientoInsumo.crear({
        ...input,
        costoUnitarioPresentacion: insumo.precioUnitarioPresentacion,
        costoUnitarioUso: insumo.precioUnitarioUso,
        valorInventarioResultante: insumo.valorInventario(),
        });

        await this.insumoRepo.guardar(insumo);
        const guardado = await this.movimientoRepo.guardar(movimiento);

        return {
        id: guardado.id as number,
        insumoId: guardado.insumoId,
        tipo: guardado.tipo,
        cantidadUso: guardado.cantidadUso,
        costoTotal: guardado.costoTotal,
        stockResultante: insumo.stockUso,
        };
    }
}