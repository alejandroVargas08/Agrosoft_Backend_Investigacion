import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RESERVA_REPOSITORY_PORT } from '../../../domain/ports/reserva.repository.port';
import type { ReservaRepositoryPort } from '../../../domain/ports/reserva.repository.port';
import { ReservaOutput } from '../../dto/reserva.dto';

@Injectable()
export class ConfirmarReservaUseCase {
    constructor(
        @Inject(RESERVA_REPOSITORY_PORT) private readonly reservaRepo: ReservaRepositoryPort,
    ) {}

    async ejecutar(reservaId: number): Promise<ReservaOutput> {
        const reserva = await this.reservaRepo.buscarPorId(reservaId);
        if (!reserva) throw new NotFoundException(`No existe la reserva con id ${reservaId}`);

        reserva.confirmar();
        const actualizada = await this.reservaRepo.guardar(reserva);

        return {
        id: actualizada.id as number,
        insumoId: actualizada.insumoId,
        cantidad: actualizada.cantidad,
        estado: actualizada.estado,
        };
    }
}