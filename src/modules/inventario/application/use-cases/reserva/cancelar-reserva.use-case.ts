import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RESERVA_REPOSITORY_PORT } from '../../../domain/ports/reserva.repository.port';
import type { ReservaRepositoryPort } from '../../../domain/ports/reserva.repository.port';
import { INSUMO_REPOSITORY_PORT } from '../../../domain/ports/insumo.repository.port';
import type { InsumoRepositoryPort } from '../../../domain/ports/insumo.repository.port';

@Injectable()
export class CancelarReservaUseCase {
    constructor(
        @Inject(RESERVA_REPOSITORY_PORT) private readonly reservaRepo: ReservaRepositoryPort,
        @Inject(INSUMO_REPOSITORY_PORT) private readonly insumoRepo: InsumoRepositoryPort,
    ) {}

    async ejecutar(reservaId: number): Promise<void> {
        const reserva = await this.reservaRepo.buscarPorId(reservaId);
        if (!reserva) throw new NotFoundException(`No existe la reserva con id ${reservaId}`);

        const insumo = await this.insumoRepo.buscarPorId(reserva.insumoId);
        if (!insumo) throw new NotFoundException(`No existe el insumo con id ${reserva.insumoId}`);

        reserva.cancelar();
        insumo.liberarReserva(reserva.cantidad);

        await this.reservaRepo.guardar(reserva);
        await this.insumoRepo.guardar(insumo);
    }
}