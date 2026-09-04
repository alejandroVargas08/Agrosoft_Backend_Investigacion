import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ESTADO_FORMULARIO_REPOSITORY_PORT } from '../../domain/ports/estado-formulario.repository.port';
import type { EstadoFormularioRepositoryPort } from '../../domain/ports/estado-formulario.repository.port';

@Injectable()
export class FinalizarConversacionUseCase {
    constructor(
        @Inject(ESTADO_FORMULARIO_REPOSITORY_PORT)
        private readonly repo: EstadoFormularioRepositoryPort,
    ) {}

    async ejecutar(telegramUserId: string, completadaConExito: boolean): Promise<void> {
        const estadoFormulario = await this.repo.buscarPorTelegramUserId(telegramUserId);
        if (!estadoFormulario) {
        throw new NotFoundException('No hay una conversación activa para este usuario de Telegram');
        }

        if (completadaConExito) {
        estadoFormulario.completar();
        } else {
        estadoFormulario.cancelar();
        }

        await this.repo.guardar(estadoFormulario);
    }
}