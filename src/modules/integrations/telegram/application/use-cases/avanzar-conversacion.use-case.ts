import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ESTADO_FORMULARIO_REPOSITORY_PORT } from '../../domain/ports/estado-formulario.repository.port';
import type { EstadoFormularioRepositoryPort } from '../../domain/ports/estado-formulario.repository.port';
import { AvanzarConversacionInput, EstadoFormularioOutput } from '../dto/estado-formulario.dto';

@Injectable()
export class AvanzarConversacionUseCase {
    constructor(
        @Inject(ESTADO_FORMULARIO_REPOSITORY_PORT)
        private readonly repo: EstadoFormularioRepositoryPort,
    ) {}

    async ejecutar(input: AvanzarConversacionInput): Promise<EstadoFormularioOutput> {
        const estadoFormulario = await this.repo.buscarPorTelegramUserId(input.telegramUserId);
        if (!estadoFormulario) {
        throw new NotFoundException('No hay una conversación activa para este usuario de Telegram');
        }

        estadoFormulario.avanzarA(input.siguienteStep, input.datosNuevos);
        const actualizado = await this.repo.guardar(estadoFormulario);

        return {
        telegramUserId: actualizado.telegramUserId,
        step: actualizado.step,
        data: actualizado.data,
        estado: actualizado.estado,
        };
    }
}