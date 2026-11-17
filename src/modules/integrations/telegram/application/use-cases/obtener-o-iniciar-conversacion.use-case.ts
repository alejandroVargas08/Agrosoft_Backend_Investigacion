import { Inject, Injectable } from '@nestjs/common';
import { EstadoFormulario } from '../../domain/entities/estado-formulario.entity';
import { ESTADO_FORMULARIO_REPOSITORY_PORT } from '../../domain/ports/estado-formulario.repository.port';
import type { EstadoFormularioRepositoryPort } from '../../domain/ports/estado-formulario.repository.port';
import { EstadoFormularioOutput } from '../dto/estado-formulario.dto';

@Injectable()
export class ObtenerOIniciarConversacionUseCase {
    constructor(
        @Inject(ESTADO_FORMULARIO_REPOSITORY_PORT)
        private readonly repo: EstadoFormularioRepositoryPort,
    ) {}

    async ejecutar(telegramUserId: string, stepInicial: string): Promise<EstadoFormularioOutput> {
        let estadoFormulario = await this.repo.buscarPorTelegramUserId(telegramUserId);

        if (!estadoFormulario || !estadoFormulario.estaActiva()) {
        estadoFormulario = EstadoFormulario.iniciar(telegramUserId, stepInicial);
        estadoFormulario = await this.repo.guardar(estadoFormulario);
        }

        return {
        telegramUserId: estadoFormulario.telegramUserId,
        step: estadoFormulario.step,
        data: estadoFormulario.data,
        estado: estadoFormulario.estado,
        };
    }
}