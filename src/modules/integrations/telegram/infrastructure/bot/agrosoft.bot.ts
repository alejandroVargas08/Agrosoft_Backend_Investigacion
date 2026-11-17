import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
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
import { ObtenerReporteUseCase } from '../../../../../reportes/application/use-cases/obtener-reporte.use-case';
import { ListarSensorAlertasUseCase } from '../../../../iot/application/use-cases/sensor-alertas/listar-sensor-alertas.use-case';
import { ListarInsumosBajoStockMinimoUseCase } from '../../../../inventario/application/use-cases/insumo/listar-insumos-bajo-stock-minimo.use-case';
import { VincularUsuarioUseCase } from '../../application/use-cases/vincular-usuario.use-case';
import { BuscarVinculoUseCase } from '../../application/use-cases/buscar-vinculo.use-case';
import { DesvincularUsuarioUseCase } from '../../application/use-cases/desvincular-usuario.use-case';
import { VincularConCodigoUseCase } from '../../application/use-cases/vincular-con-codigo.use-case';
import type { VinculoUsuario } from '../../domain/entities/vinculo-usuario.entity';
import { CONTEXTO_ACCESO_TOKEN } from '../../../../iam/domain/ports/contexto-acceso.token';
import type { ContextoAccesoPort } from '../../../../iam/domain/ports/contexto-acceso.port';
import type { UsuarioAutenticado } from '../../../../iam/domain/value-objects/alcance-datos.vo';

const SIN_DATO = '-';
const PERMISO_GESTIONAR_INCIDENCIAS = 'incidencias.gestionar';
const PERMISO_VER_INCIDENCIAS = 'incidencias.ver';

// El login no es un flujo de application/flows: tiene su propio camino
const PASO_CORREO = 'login:correo';
const PASO_PASSWORD = 'login:password';

const MENU = [
    'AgroSoft — esto es lo que puedo hacer:',
    '',
    '/incidencia — registrar una plaga, enfermedad o evento',
    '/tratamiento — registrar un tratamiento aplicado',
    '/alertas — ver alertas de sensores e insumos bajo mínimo',
    '/reporte — ver producción, ingresos y rentabilidad',
    '/cancelar — cancelar lo que esté en curso',
    '/salir — desvincular esta cuenta de AgroSoft',
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
        private readonly obtenerReporte: ObtenerReporteUseCase,
        private readonly listarSensorAlertas: ListarSensorAlertasUseCase,
        private readonly listarInsumosBajoStock: ListarInsumosBajoStockMinimoUseCase,
        private readonly vincularUsuario: VincularUsuarioUseCase,
        private readonly buscarVinculo: BuscarVinculoUseCase,
        private readonly desvincularUsuario: DesvincularUsuarioUseCase,
        private readonly vincularConCodigo: VincularConCodigoUseCase,
        @Inject(CONTEXTO_ACCESO_TOKEN) private readonly contextoAcceso: ContextoAccesoPort,
    ) {}

    // ─── Comandos ────────────────────────────────────────────────────────────

    @Start()
    async alIniciar(@Ctx() ctx: Context) {
        const telegramUserId = this.idDe(ctx);
        if (!telegramUserId) return;

        await this.cancelarSilenciosamente(ctx);

        const vinculo = await this.buscarVinculo.ejecutar(telegramUserId);
        if (vinculo) {
            await ctx.reply('Hola ' + vinculo.nombre + '.\n\n' + MENU);
            return;
        }

        // /start ABC-123: el codigo lo genero la pantalla de Configuracion.
        // Asi la persona no tiene que escribir su contrasena en el chat.
        const codigo = this.codigoDe(ctx);
        if (codigo) {
            try {
                const nuevoVinculo = await this.vincularConCodigo.ejecutar(telegramUserId, codigo);
                await ctx.reply('Listo, ' + nuevoVinculo.nombre + '. Tu cuenta quedo vinculada.\n\n' + MENU);
                return;
            } catch {
                await ctx.reply(
                    'Ese codigo no sirve o ya expiro. Genera uno nuevo en AgroSoft, ' +
                    'en Configuracion > Vincular con Telegram.\n\n' +
                    'Tambien puedes entrar con tu correo: escribelo ahora.',
                );
                await this.obtenerOIniciarConversacion.ejecutar(telegramUserId, PASO_CORREO);
                return;
            }
        }

        // Sin vinculo no se puede hacer nada: lo primero es saber quien escribe
        await this.obtenerOIniciarConversacion.ejecutar(telegramUserId, PASO_CORREO);
        await ctx.reply(
            'Soy el bot de AgroSoft. Antes de empezar necesito saber quien eres.\n\n' +
            'Escribe el correo con el que entras a AgroSoft.',
        );
    }

    @Command('salir')
    async alSalir(@Ctx() ctx: Context) {
        const telegramUserId = this.idDe(ctx);
        if (!telegramUserId) return;

        await this.cancelarSilenciosamente(ctx);
        await this.desvincularUsuario.ejecutar(telegramUserId);
        await ctx.reply('Desvinculé tu cuenta. Escribe /start para entrar otra vez.');
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
        if (!(await this.exigirPermiso(ctx, PERMISO_GESTIONAR_INCIDENCIAS, 'registrar incidencias'))) return;
        await this.iniciarFlujo(ctx, 'incidencia');
    }

    @Command('tratamiento')
    async alRegistrarTratamiento(@Ctx() ctx: Context) {
        if (!(await this.exigirPermiso(ctx, PERMISO_GESTIONAR_INCIDENCIAS, 'registrar tratamientos'))) return;
        await this.iniciarFlujo(ctx, 'tratamiento');
    }

    @Command('reporte')
    async alPedirReporte(@Ctx() ctx: Context) {
        if (!(await this.exigirVinculo(ctx))) return;

        try {
            const reporte = await this.obtenerReporte.ejecutar('mensual');
            const r = reporte.resumen;

            const lineas = [
                'Reporte de los ultimos 6 meses',
                '',
                'Produccion: ' + this.kg(r.produccionTotalKg),
                'Ingresos: ' + this.pesos(r.ingresos),
                'Egresos: ' + this.pesos(r.egresos),
                'Rentabilidad: ' + r.rentabilidad + '%',
                'Unidades activas: ' + r.unidadesActivas,
            ];

            // Los tres cultivos que mas aportaron, si hay produccion registrada
            if (reporte.distribucion.length > 0) {
                lineas.push('', 'Cultivos con mas produccion:');
                for (const fila of reporte.distribucion.slice(0, 3)) {
                    lineas.push('- ' + fila.name + ': ' + this.kg(fila.value));
                }
            }

            await ctx.reply(lineas.join('\n'));
        } catch (error) {
            this.logger.error('Fallo el reporte', error as Error);
            await ctx.reply('No pude traer el reporte en este momento.');
        }
    }

    @Command('alertas')
    async alPedirAlertas(@Ctx() ctx: Context) {
        if (!(await this.exigirVinculo(ctx))) return;

        try {
            // Las dos fuentes son independientes, se piden en paralelo
            const [alertasSensores, insumos] = await Promise.all([
                this.listarSensorAlertas.execute(),
                this.listarInsumosBajoStock.ejecutar(),
            ]);

            const recientes = [...alertasSensores]
                .sort((a, b) => b.fechaAlerta.getTime() - a.fechaAlerta.getTime())
                .slice(0, 5);

            const lineas: string[] = ['Alertas'];

            lineas.push('', 'Sensores (' + alertasSensores.length + '):');
            if (recientes.length === 0) {
                lineas.push('- Sin alertas registradas');
            } else {
                for (const alerta of recientes) {
                    lineas.push(
                        '- Sensor ' + alerta.sensorId + ' (' + alerta.tipo + '): ' +
                        alerta.valor + ' / umbral ' + alerta.umbral +
                        ' — ' + this.fechaCorta(alerta.fechaAlerta),
                    );
                }
                if (alertasSensores.length > recientes.length) {
                    lineas.push('  ...y ' + (alertasSensores.length - recientes.length) + ' mas');
                }
            }

            lineas.push('', 'Insumos bajo minimo (' + insumos.length + '):');
            if (insumos.length === 0) {
                lineas.push('- Todo el inventario esta por encima del minimo');
            } else {
                for (const insumo of insumos.slice(0, 5)) {
                    lineas.push(
                        '- ' + insumo.nombre + ': ' + insumo.stockUso + ' ' + insumo.unidadUso +
                        ' (minimo ' + insumo.stockMinimo + ')',
                    );
                }
                if (insumos.length > 5) {
                    lineas.push('  ...y ' + (insumos.length - 5) + ' mas');
                }
            }

            await ctx.reply(lineas.join('\n'));
        } catch (error) {
            this.logger.error('Fallaron las alertas', error as Error);
            await ctx.reply('No pude traer las alertas en este momento.');
        }
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

    // ─── Vinculación de cuenta ───────────────────────────────────────────────

    /** Devuelve el usuario vinculado, o null después de avisarle que use /start. */
    /** Lee el payload de "/start ABC-123" */
    private codigoDe(ctx: Context): string | null {
        const texto = (ctx.message as { text?: string } | undefined)?.text ?? '';
        const partes = texto.trim().split(/\s+/);
        return partes.length > 1 && partes[1].length > 0 ? partes[1] : null;
    }

    private async exigirVinculo(ctx: Context): Promise<VinculoUsuario | null> {
        const telegramUserId = this.idDe(ctx);
        if (!telegramUserId) return null;

        const vinculo = await this.buscarVinculo.ejecutar(telegramUserId);
        if (!vinculo) {
            await ctx.reply('Primero tienes que vincular tu cuenta de AgroSoft. Escribe /start.');
            return null;
        }
        return vinculo;
    }

    private async usuarioDe(ctx: Context): Promise<UsuarioAutenticado | null> {
        const vinculo = await this.exigirVinculo(ctx);
        if (!vinculo) return null;

        const usuario = await this.contextoAcceso.obtener(vinculo.usuarioId);
        if (!usuario) {
            await ctx.reply('Tu usuario de AgroSoft no está activo. Escribe /salir y vuelve a entrar con /start.');
            return null;
        }
        return usuario;
    }

    private async exigirPermiso(ctx: Context, permiso: string, accion: string): Promise<UsuarioAutenticado | null> {
        const usuario = await this.usuarioDe(ctx);
        if (!usuario) return null;

        if (!usuario.permisos.includes(permiso)) {
            await ctx.reply('Tu rol no tiene permiso para ' + accion + '.');
            return null;
        }
        return usuario;
    }

    private async procesarLogin(
        ctx: Context,
        telegramUserId: string,
        step: string,
        datos: Record<string, unknown>,
        valor: string,
    ) {
        const respuesta = valor.trim();

        if (step === PASO_CORREO) {
            if (!respuesta.includes('@')) {
                await ctx.reply('Eso no parece un correo. Escríbelo completo, por ejemplo nombre@correo.com');
                return;
            }

            await this.avanzarConversacion.ejecutar({
                telegramUserId,
                siguienteStep: PASO_PASSWORD,
                datosNuevos: { correo: respuesta },
            });
            await ctx.reply('Ahora tu contraseña. La borro del chat apenas la reciba.');
            return;
        }

        // Lo primero es sacar la contraseña del historial del chat
        await this.borrarMensaje(ctx);

        try {
            const vinculo = await this.vincularUsuario.ejecutar(
                telegramUserId,
                this.texto(datos.correo),
                respuesta,
            );

            await this.finalizarConversacion.ejecutar(telegramUserId, true);
            await ctx.reply('Listo, ' + vinculo.nombre + '. Tu cuenta quedó vinculada.\n\n' + MENU);
        } catch {
            // Se vuelve al correo: puede haberse equivocado en cualquiera de los dos
            await this.avanzarConversacion.ejecutar({
                telegramUserId,
                siguienteStep: PASO_CORREO,
                datosNuevos: {},
            });
            await ctx.reply('Correo o contraseña incorrectos. Escribe tu correo otra vez.');
        }
    }

    private async borrarMensaje(ctx: Context) {
        try {
            await ctx.deleteMessage();
        } catch {
            // en algunos chats el bot no tiene permiso para borrar; no es crítico
        }
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
        const opciones = await this.opcionesDe(ctx, paso);
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
    private async opcionesDe(ctx: Context, paso: PasoFlujo): Promise<OpcionPaso[]> {
        if (paso.opciones && paso.opciones.length > 0) return paso.opciones;
        if (paso.fuente !== 'incidencias') return [];

        const usuario = await this.usuarioDe(ctx);
        if (!usuario || !usuario.permisos.includes(PERMISO_VER_INCIDENCIAS)) return [];

        const incidencias = await this.listarIncidencias.ejecutar(usuario);
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

        // El login va antes que todo lo demás
        if (conversacion.step.startsWith('login:')) {
            await this.procesarLogin(ctx, telegramUserId, conversacion.step, conversacion.data, valor);
            return;
        }

        if (!(await this.exigirVinculo(ctx))) return;

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

        const usuario = await this.exigirPermiso(ctx, PERMISO_GESTIONAR_INCIDENCIAS, 'guardar esto');
        if (!usuario) {
            await this.cancelarSilenciosamente(ctx);
            return;
        }

        try {
            if (flujo.comando === 'incidencia') {
                const creada = await this.crearIncidencia.ejecutar({
                    titulo: this.texto(datos.titulo),
                    tipo: this.texto(datos.tipo),
                    severidad: this.severidad(datos.severidad),
                    cultivoId: this.numero(datos.cultivoId) ?? undefined,
                    descripcion: this.opcional(datos.descripcion) ?? undefined,
                }, usuario);

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
                }, usuario);

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
            const motivo = error instanceof HttpException ? '\n\nMotivo: ' + error.message : '';
            await ctx.reply(
                'No pude guardarlo. Revisa los datos e inténtalo otra vez con /' + flujo.comando + motivo,
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

    private fechaCorta(fecha: Date): string {
        return new Intl.DateTimeFormat('es-CO', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
        }).format(fecha);
    }

    private pesos(valor: number): string {
        return '$ ' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor || 0);
    }

    private kg(valor: number): string {
        return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor || 0) + ' kg';
    }

    /** Los botones ya mandan low/medium/high; esto solo lo vuelve explícito para TypeScript. */
    private severidad(valor: unknown): 'low' | 'medium' | 'high' {
        const limpio = this.texto(valor).toLowerCase();
        if (limpio === 'low' || limpio === 'medium' || limpio === 'high') return limpio;
        return 'medium';
    }

    private texto(valor: unknown): string {
        return String(valor ?? '').trim();
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
