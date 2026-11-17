import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

/**
 * Arranca el long polling del bot sin poner en riesgo el backend.
 *
 * nestjs-telegraf llama a bot.launch() sin esperar ni capturar la promesa: si
 * Telegram responde 409 (otro proceso ya usa el mismo token) la promesa queda
 * rechazada sin manejar y Node tumba todo el servidor. Aquí el error se
 * registra y el resto de AgroSoft sigue funcionando sin bot.
 */
@Injectable()
export class ArranqueBotTelegram implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('Telegram');
  private activo = false;

  constructor(@InjectBot() private readonly bot: Telegraf) {}

  onApplicationBootstrap(): void {
    this.activo = true;
    // launch() solo se resuelve cuando el bot se detiene: no se espera
    this.bot.launch().catch((error: unknown) => {
      this.activo = false;
      const codigo = (error as { response?: { error_code?: number } })?.response?.error_code;
      if (codigo === 409) {
        this.logger.warn(
          'Otro proceso ya está usando este bot (mismo TELEGRAM_BOT_TOKEN): otro backend abierto o el de un ' +
            'compañero con el mismo token. AgroSoft sigue funcionando, pero sin bot de Telegram.',
        );
      } else if (codigo === 401) {
        this.logger.warn('Telegram rechazó el TELEGRAM_BOT_TOKEN (401). AgroSoft sigue funcionando sin bot.');
      } else {
        this.logger.error(`El bot de Telegram no pudo arrancar: ${(error as Error)?.message ?? error}`);
      }
    });
  }

  onApplicationShutdown(): void {
    if (!this.activo) return;
    try {
      this.bot.stop();
    } catch {
      // ya estaba detenido
    }
  }
}
