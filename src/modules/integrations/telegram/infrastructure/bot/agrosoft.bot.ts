import { Injectable } from '@nestjs/common';
import { Update, Start, On, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ObtenerOIniciarConversacionUseCase } from '../../application/use-cases/obtener-o-iniciar-conversacion.use-case';
import { AvanzarConversacionUseCase } from '../../application/use-cases/avanzar-conversacion.use-case';
import { FinalizarConversacionUseCase } from '../../application/use-cases/finalizar-conversacion.use-case';

/**
 * El bot NO decide reglas de negocio — solo recibe la interacción del
 * usuario de Telegram y llama a los casos de uso correspondientes.
 * Por ahora solo maneja el flujo de conversación de este módulo; cuando
 * el bot necesite disparar cosas de otros módulos (ej. registrar una
 * actividad), llamará a los casos de uso de esos módulos igual que este
 * archivo llama a los suyos, nunca importando su dominio directamente.
 */
@Update()
@Injectable()
export class AgrosoftBot {
    constructor(
        private readonly obtenerOIniciarConversacion: ObtenerOIniciarConversacionUseCase,
        private readonly avanzarConversacion: AvanzarConversacionUseCase,
        private readonly finalizarConversacion: FinalizarConversacionUseCase,
    ) {}

    @Start()
    async alIniciar(@Ctx() ctx: Context) {
        const telegramUserId = ctx.from?.id.toString();
        if (!telegramUserId) return;

        const conversacion = await this.obtenerOIniciarConversacion.ejecutar(telegramUserId, 'inicio');
        await ctx.reply(
        `¡Hola! Bienvenido al bot de Agrosoft. Estás en el paso: ${conversacion.step}`,
        );
    }

    @On('text')
    async alRecibirTexto(@Ctx() ctx: Context) {
        const telegramUserId = ctx.from?.id.toString();
        if (!telegramUserId) return;

        const mensaje = (ctx.message as { text?: string })?.text ?? '';

        if (mensaje === '/cancelar') {
        await this.finalizarConversacion.ejecutar(telegramUserId, false);
        await ctx.reply('Conversación cancelada.');
        return;
        }

        // Aquí es donde, según el `step` actual de la conversación, decidirías
        // qué hacer con el mensaje del usuario (guardarlo como respuesta a una
        // pregunta, avanzar al siguiente paso, etc.). Esta parte depende del
        // formulario específico que construyan — dejo el ejemplo más simple:
        await this.avanzarConversacion.ejecutar({
        telegramUserId,
        siguienteStep: 'esperando_siguiente_dato',
        datosNuevos: { ultimoMensaje: mensaje },
        });

        await ctx.reply('Recibido, avanzando al siguiente paso.');
    }
    }