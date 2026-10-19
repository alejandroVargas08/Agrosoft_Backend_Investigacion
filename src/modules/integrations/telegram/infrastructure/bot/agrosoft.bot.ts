import { Injectable, Logger } from '@nestjs/common';
import { Action, Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';

import { ObtenerOIniciarConversacionUseCase } from '../../application/use-cases/obtener-o-iniciar-conversacion.use-case';
import { AvanzarConversacionUseCase } from '../../application/use-cases/avanzar-conversacion.use-case';
import { FinalizarConversacionUseCase } from '../../application/use-cases/finalizar-conversacion.use-case';
import { buscarFlujo } from '../../application/flows';
import type { Flujo, OpcionPaso, PasoFlujo } from '../../application/flows';

import { CrearIncidenciaUseCase } from '../../../../../produccion/incidencias/application/use-cases/crear.incidencia.use-case';
import { ListarIncidenciasUseCase } from '../../../../../produccion/incidencias/application/use-cases/listar.incidencias.use-case';
import { CrearTratamientoUseCase } from '../../../../../produccion/tratamientos/application/use-cases/crear.tratamiento.use-case';

const SIN_DATO = '-';

const MENU = [
    'AgroSoft — esto es lo que puedo hacer:',
    '',
    '/incidencia — registrar una plaga, enfermedad o evento',
    '/tratamiento — registrar un tratamiento aplicado',
    '/cancelar — cancelar lo que esté en curso',
    '/ayuda — volver a ver esta lista',
].join('\n');

/**
 * El bot no conoce las reglas de negocio: recorre los pasos del flujo que le
 * corresponda y, al terminar, llama al caso de uso del módulo dueño del dato.
 * Agregar un comando nuevo es agregar un flujo en application/flows y su rama
 * en `ejecutarFlujo`.
 */
@Update()
@Injectable()
export class AgrosoftBot {
    private readonly logger = new Logger(AgrosoftBot.name);

    constructor(
        private readonly obtenerOIniciarConversacion: ObtenerOIniciarConversacionUseCase,
        private readonly avanzarConversacion: AvanzarConversacionUseCase,
        private readonly finalizarConversacion: FinalizarConversacionUseCase,
        private readonly crearIncidencia: CrearIncidenciaUseCase,
        private readonly listarIncidencias: ListarIncidenciasUseCase,
        private readonly crearTratamiento: CrearTratamientoUseCase,
    ) {}

    // ─── Comandos ────────────────────────────────────────────────────────────

    @Start()
    async alIniciar(@Ctx() ctx: Context) {
        await this.cancelarSilenciosamente(ctx);
        await ctx.reply('¡Hola! Soy el bot de AgroSoft.\n\n' + MENU);
    }

    @Command('ayuda')
    async alPedirAyuda(@Ctx() ctx: Context) {
        await ctx.reply(MENU);
    }

    @Command('cancelar')
    async alCancelar(@Ctx() ctx: Context) {
        const telegramUserId = this.idDe(ctx);
        if (!telegramUserId) return;

        try {
            await this.finalizarConversacion.ejecutar(telegramUserId, false);
            await ctx.reply('Listo, cancelé lo que estabas haciendo.\n\n' + MENU);
        } catch {
            await ctx.reply('No tenías nada en curso.\n\n' + MENU);
        }
    }

    @Command('incidencia')
    async alRegistrarIncidencia(@Ctx() ctx: Context) {
        await this.iniciarFlujo(ctx, 'incidencia');
    }

    @Command('tratamiento')
    async alRegistrarTratamiento(@Ctx() ctx: Context) {
        await this.iniciarFlujo(ctx, 'tratamiento');
    }

    // ─── Entradas del usuario ────────────────────────────────────────────────

    @On('text')
    async alRecibirTexto(@Ctx() ctx: Context) {
        const texto = (ctx.message as { text?: string } | undefined)?.text ?? '';
        if (texto.startsWith('/')) return; // cada comando tiene su propio manejador
        await this.procesarRespuesta(ctx, texto);
    }

    @Action(/^op:/)
    async alTocarBoton(@Ctx() ctx: Context) {
        const data = (ctx.callbackQuery as { data?: string } | undefined)?.data ?? '';
        await ctx.answerCbQuery();
        await this.procesarRespuesta(ctx, data.slice('op:'.length));
    }

    // ─── Motor de flujos ─────────────────────────────────────────────────────

    private async iniciarFlujo(ctx: Context, comando: string) {
        const telegramUserId = this.idDe(ctx);
        if (!telegramUserId) return;

        const flujo = buscarFlujo(comando);
        const primerPaso = flujo?.pasos[0];
        if (!flujo || !primerPaso) {
            await ctx.reply('Ese comando todavía no está disponible.');
            return;
        }

        await this.cancelarSilenciosamente(ctx);
        await this.obtenerOIniciarConversacion.ejecutar(telegramUserId, comando + ':0');

        await ctx.reply(
            flujo.nombre + '\n\nTe voy a hacer ' + flujo.pasos.length +
            ' preguntas. Puedes escribir /cancelar en cualquier momento.',
        );
        await this.preguntar(ctx, primerPaso);
    }

    private async preguntar(ctx: Context, paso: PasoFlujo) {
        const opciones = await this.opcionesDe(paso);
        if (opciones.length === 0) {
            await ctx.reply(paso.pregunta);
            return;
        }

        const botones = opciones.map((opcion) => [
            Markup.button.callback(opcion.etiqueta, 'op:' + opcion.valor),
        ]);
        await ctx.reply(paso.pregunta, Markup.inlineKeyboard(botones));
    }

    /**
     * Un paso puede traer sus opciones escritas a mano, o pedirlas a un módulo
     * de negocio en el momento de preguntar (así los botones muestran datos
     * reales y no un número que el usuario tendría que adivinar).
     */
    private async opcionesDe(paso: PasoFlujo): Promise<OpcionPaso[]> {
        if (paso.opciones && paso.opciones.length > 0) return paso.opciones;
        if (paso.fuente !== 'incidencias') return [];

        const incidencias = await this.listarIncidencias.ejecutar();
        const abiertas = incidencias
            .filter((incidencia) => incidencia.estado !== 'resolved')
            .slice(0, 10)
            .map((incidencia) => ({
                etiqueta: incidencia.titulo,
                valor: String(incidencia.id ?? ''),
            }));

        if (abiertas.length === 0) return [];
        return [...abiertas, { etiqueta: 'Sin incidencia', valor: SIN_DATO }];
    }

    private async procesarRespuesta(ctx: Context, valor: string) {
        const telegramUserId = this.idDe(ctx);
        if (!telegramUserId) return;

        // Si no hay conversación activa, este caso de uso abre una en 'inicio',
        // que no corresponde a ningún flujo: ahí respondemos con el menú.
        const conversacion = await this.obtenerOIniciarConversacion.ejecutar(telegramUserId, 'inicio');
        const [comando, indiceTexto] = conversacion.step.split(':');
        const flujo = comando ? buscarFlujo(comando) : undefined;
        const indice = Number(indiceTexto);

        if (!flujo || !Number.isInteger(indice)) {
            await ctx.reply('No hay nada en curso.\n\n' + MENU);
            return;
        }

        const paso = flujo.pasos[indice];
        if (!paso) {
            await this.cancelarSilenciosamente(ctx);
            await ctx.reply('Perdí el hilo de la conversación. Vuelve a empezar.\n\n' + MENU);
            return;
        }

        const respuesta = valor.trim();
        const vacia = respuesta.length === 0 || (respuesta === SIN_DATO && !paso.opcional);
        if (vacia) {
            await ctx.reply('Ese dato es obligatorio.');
            await this.preguntar(ctx, paso);
            return;
        }

        const reclamo = this.validar(paso, respuesta);
        if (reclamo) {
            await ctx.reply(reclamo);
            await this.preguntar(ctx, paso);
            return;
        }

        const siguiente = indice + 1;
        const esUltimo = siguiente >= flujo.pasos.length;

        const actualizada = await this.avanzarConversacion.ejecutar({
            telegramUserId,
            siguienteStep: esUltimo ? flujo.comando + ':fin' : flujo.comando + ':' + siguiente,
            datosNuevos: { [paso.campo]: respuesta },
        });

        if (!esUltimo) {
            const pasoSiguiente = flujo.pasos[siguiente];
            if (pasoSiguiente) await this.preguntar(ctx, pasoSiguiente);
            return;
        }

        await this.ejecutarFlujo(ctx, flujo, actualizada.data);
    }

    /** Aquí es donde el bot cruza hacia los módulos de negocio. */
    private async ejecutarFlujo(ctx: Context, flujo: Flujo, datos: Record<string, unknown>) {
        const telegramUserId = this.idDe(ctx);
        if (!telegramUserId) return;

        try {
            if (flujo.comando === 'incidencia') {
                const creada = await this.crearIncidencia.ejecutar({
                    titulo: this.texto(datos.titulo),
                    tipo: this.texto(datos.tipo),
                    severidad: this.severidad(datos.severidad),
                    cultivoId: this.numero(datos.cultivoId) ?? undefined,
                    descripcion: this.opcional(datos.descripcion) ?? undefined,
                });

                await this.finalizarConversacion.ejecutar(telegramUserId, true);
                await ctx.reply(
                    'Incidencia registrada.\n\n' +
                    'N.º ' + String(creada?.id ?? '') + ' — ' + this.texto(datos.titulo) + '\n\n' +
                    'Escribe /ayuda para hacer otra cosa.',
                );
                return;
            }

            if (flujo.comando === 'tratamiento') {
                const creado = await this.crearTratamiento.ejecutar({
                    incidenciaId: this.numero(datos.incidenciaId) ?? undefined,
                    producto: this.texto(datos.producto),
                    dosis: this.opcional(datos.dosis) ?? undefined,
                    fecha: this.opcional(datos.fecha) ?? undefined,
                    costo: this.numero(datos.costo) ?? undefined,
                    notas: this.opcional(datos.notas) ?? undefined,
                });

                await this.finalizarConversacion.ejecutar(telegramUserId, true);
                await ctx.reply(
                    'Tratamiento registrado.\n\n' +
                    'N.º ' + String(creado?.id ?? '') + ' — ' + this.texto(datos.producto) + '\n\n' +
                    'Escribe /ayuda para hacer otra cosa.',
                );
                return;
            }

            await ctx.reply('Ese flujo todavía no está conectado a su módulo.');
        } catch (error) {
            this.logger.error('Falló el flujo ' + flujo.comando, error as Error);
            await this.cancelarSilenciosamente(ctx);
            await ctx.reply(
                'No pude guardarlo. Revisa los datos e inténtalo otra vez con /' + flujo.comando,
            );
        }
    }

    // ─── Utilidades ──────────────────────────────────────────────────────────

    private idDe(ctx: Context): string | null {
        return ctx.from?.id ? String(ctx.from.id) : null;
    }

    private async cancelarSilenciosamente(ctx: Context) {
        const telegramUserId = this.idDe(ctx);
        if (!telegramUserId) return;
        try {
            await this.finalizarConversacion.ejecutar(telegramUserId, false);
        } catch {
            // no había conversación activa: no hay nada que cancelar
        }
    }

    /** Devuelve null si la respuesta sirve, o el reclamo que hay que mostrar. */
    private validar(paso: PasoFlujo, respuesta: string): string | null {
        if (respuesta === SIN_DATO) return null; // el paso opcional se omite

        if (paso.formato === 'numero') {
            return Number.isFinite(Number(respuesta.replace(/[.\s]/g, '')))
                ? null
                : 'Eso no parece un número. Escribe solo dígitos, sin puntos ni letras.';
        }

        if (paso.formato === 'fecha') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(respuesta)) {
                return 'La fecha va en formato AAAA-MM-DD. Ejemplo: 2026-10-19';
            }
            return Number.isNaN(Date.parse(respuesta))
                ? 'Esa fecha no existe. Revísala y escríbela como AAAA-MM-DD.'
                : null;
        }

        return null;
    }

    private texto(valor: unknown): string {
        return String(valor ?? '').trim();
    }

    // Los botones envían low/medium/high, pero si alguien escribe texto libre
    // podría llegar cualquier cosa: aquí se normaliza antes del caso de uso.
    private severidad(valor: unknown): 'low' | 'medium' | 'high' {
        const limpio = this.texto(valor);
        return limpio === 'low' || limpio === 'medium' || limpio === 'high' ? limpio : 'medium';
    }

    private opcional(valor: unknown): string | null {
        const limpio = this.texto(valor);
        return limpio.length === 0 || limpio === SIN_DATO ? null : limpio;
    }

    private numero(valor: unknown): number | null {
        const limpio = this.opcional(valor);
        if (limpio === null) return null;
        // La gente escribe 400.000 o 400 000: se quitan los separadores de miles
        const numero = Number(limpio.replace(/[.\s]/g, ''));
        return Number.isFinite(numero) ? numero : null;
    }
}