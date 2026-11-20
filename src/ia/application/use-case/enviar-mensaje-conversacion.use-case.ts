import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ConversacionIARepositoryPort } from '../../domain/ports/conversacion-ia.repository.port';
import type { MensajeIARepositoryPort } from '../../domain/ports/mensaje-ia.repository.port';
import type { IaProviderPort, MensajeHistorial } from '../../domain/ports/ia-provider.port';
import { CONVERSACION_IA_REPOSITORY } from '../../domain/ports/conversacion-ia.repository.token';
import { MENSAJE_IA_REPOSITORY } from '../../domain/ports/mensaje-ia.repository.token';
import { PoliticaPersistenciaMensajesService } from '../services/politica-persistencia-mensajes.service';

const CONTEXTO_SISTEMA =
  'Eres AgroBot, el asistente agrícola de AgroSoft, la plataforma del SENA para gestionar la unidad productiva. ' +
  'Responde en español, de forma clara, breve y práctica sobre cultivos, plagas, tratamientos, manejo agrícola y los datos de la finca.';
const SIN_DATOS_DE_LA_FINCA =
  'En esta consulta NO tienes datos de la finca. Nunca inventes cifras, montos, tareas, lotes, cultivos, sensores ni nombres. ' +
  'Si preguntan por datos de la finca, di que no tienes esa información en este momento y responde solo con conocimiento agrícola general.';
const PRIMER_MENSAJE = 'Es el primer mensaje de esta conversación: saluda al usuario por su nombre una sola vez al inicio.';
const CONVERSACION_EN_CURSO =
  'La conversación ya está en curso y ya saludaste: NO vuelvas a saludar ni a decir "hola" ni el nombre del usuario al inicio. Ve directo a la respuesta.';
const SALUDO_INICIAL = /^\s*[¡!]?\s*(hola|buen[oa]s\s+(d[ií]as|tardes|noches)|saludos)\b[^.!?\n]*[.!?]?\s*/i;
const MAX_MENSAJES_HISTORIAL = 12;

@Injectable()
export class EnviarMensajeConversacionUseCase {
  constructor(
    @Inject(CONVERSACION_IA_REPOSITORY) private readonly conversaciones: ConversacionIARepositoryPort,
    @Inject(MENSAJE_IA_REPOSITORY) private readonly mensajes: MensajeIARepositoryPort,
    @Inject('IaProviderPort') private readonly iaProvider: IaProviderPort,
    private readonly politica: PoliticaPersistenciaMensajesService,
  ) {}

  async ejecutar(props: {
    conversacionId: number;
    mensaje: string;
    cantidadImagenes?: number;
    contexto?: string;
    tuvoDatos?: boolean;
  }): Promise<{ respuesta: string; guardado: boolean }> {
    const conversacion = await this.conversaciones.buscarPorId(props.conversacionId);
    if (!conversacion) throw new NotFoundException('Conversación no encontrada');

    const cantidadImagenes = props.cantidadImagenes ?? 0;
    const tieneImagenes = cantidadImagenes > 0;

    const historialPrevio = await this.mensajes.listarPorConversacion(props.conversacionId);
    const enCurso =
      historialPrevio.length > 0 ||
      conversacion.obtenerActualizadoEn().getTime() - conversacion.obtenerCreadoEn().getTime() > 1000;

    const sistema = [
      CONTEXTO_SISTEMA,
      enCurso ? CONVERSACION_EN_CURSO : PRIMER_MENSAJE,
      props.contexto ?? SIN_DATOS_DE_LA_FINCA,
    ].join('\n\n');

    const historial: MensajeHistorial[] = [
      { role: 'system', content: sistema },
      ...historialPrevio.slice(-MAX_MENSAJES_HISTORIAL).map((m) => ({
        role: m.obtenerRol(),
        content: m.tieneImagenesAdjuntas()
          ? `${m.obtenerContenido()} [adjuntó ${m.obtenerCantidadImagenes()} imagen(es)]`
          : m.obtenerContenido(),
      })),
      { role: 'user', content: props.mensaje },
    ];

    const respuesta = this.limpiarSaludo(await this.iaProvider.chat(historial), enCurso);

    const guardar = this.politica.debeGuardar({
      mensaje: props.mensaje,
      respuesta,
      tuvoDatos: props.tuvoDatos ?? false,
      tieneImagenes,
    });

    if (guardar) {
      await this.mensajes.crear({
        conversacionId: props.conversacionId,
        rol: 'user',
        contenido: props.mensaje,
        tieneImagenes,
        cantidadImagenes,
      });
      await this.mensajes.crear({
        conversacionId: props.conversacionId,
        rol: 'assistant',
        contenido: respuesta,
      });
    }

    conversacion.tocar();
    await this.conversaciones.guardar(conversacion);

    return { respuesta, guardado: guardar };
  }

  private limpiarSaludo(respuesta: string, enCurso: boolean): string {
    if (!enCurso) return respuesta;
    const sinSaludo = respuesta.replace(SALUDO_INICIAL, '').trimStart();
    if (sinSaludo.length === 0) return respuesta;
    return sinSaludo.charAt(0).toUpperCase() + sinSaludo.slice(1);
  }
}
