import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Reserva } from '../../../domain/entities/reserva.entity';
import { RESERVA_REPOSITORY_PORT } from '../../../domain/ports/reserva.repository.port';
import type { ReservaRepositoryPort } from '../../../domain/ports/reserva.repository.port';
import { INSUMO_REPOSITORY_PORT } from '../../../domain/ports/insumo.repository.port';
import type { InsumoRepositoryPort } from '../../../domain/ports/insumo.repository.port';
import { CrearReservaInput, ReservaOutput } from '../../dto/reserva.dto';

@Injectable()
export class CrearReservaUseCase {
    constructor(
        @Inject(INSUMO_REPOSITORY_PORT) private readonly insumoRepo: InsumoRepositoryPort,
        @Inject(RESERVA_REPOSITORY_PORT) private readonly reservaRepo: ReservaRepositoryPort,
    ) {}

    async ejecutar(input: CrearReservaInput): Promise<ReservaOutput> {
        const insumo = await this.insumoRepo.buscarPorId(input.insumoId);
        if (!insumo) throw new NotFoundException(`No existe el insumo con id ${input.insumoId}`);

        insumo.reservar(input.cantidad);
        const reserva = Reserva.crear(input);

        await this.insumoRepo.guardar(insumo);
        const guardada = await this.reservaRepo.guardar(reserva);

        return { id: guardada.id as number, insumoId: guardada.insumoId, cantidad: guardada.cantidad, estado: guardada.estado };
    }
}