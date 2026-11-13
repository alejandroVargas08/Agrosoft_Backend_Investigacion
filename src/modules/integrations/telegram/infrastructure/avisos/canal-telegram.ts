import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { AvisosService } from '../../../../avisos/application/avisos.service';
import type { Aviso, CanalAviso } from '../../../../avisos/domain/aviso';
import { VINCULO_USUARIO_REPOSITORY_PORT } from '../../domain/ports/vinculo-usuario.repository.port';
import type { VinculoUsuarioRepositoryPort } from '../../domain/ports/vinculo-usuario.repository.port';

const ICONO: Record<Aviso['tipo'], string> = {
    alerta_sensor: '🌡️',
    stock_bajo: '📦',
    actividad_vencida: '⏰',
    incidencia: '⚠️',
};

const escapar = (texto: string) =>
    texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Manda los avisos al chat de quien vinculó su cuenta. En un chat privado el
 * id del chat es el mismo id del usuario de Telegram.
 */
@Injectable()
export class CanalTelegram implements CanalAviso, OnModuleInit {
    readonly nombre = 'telegram';

    constructor(
        private readonly avisos: AvisosService,
        @InjectBot() private readonly bot: Telegraf,
        @Inject(VINCULO_USUARIO_REPOSITORY_PORT) private readonly vinculos: VinculoUsuarioRepositoryPort,
    ) {}

    onModuleInit() {
        this.avisos.registrarCanal(this);
    }

    async enviar(usuarioId: number, aviso: Aviso): Promise<void> {
        const vinculo = await this.vinculos.buscarPorUsuarioId(usuarioId);
        if (!vinculo) return;
        await this.bot.telegram.sendMessage(
            vinculo.telegramUserId,
            `${ICONO[aviso.tipo]} <b>${escapar(aviso.titulo)}</b>\n${escapar(aviso.mensaje)}`,
            { parse_mode: 'HTML' },
        );
    }
}
