import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ConversacionIARepositoryPort } from '../../domain/ports/conversacion-ia.repository.port';
import type { MensajeIARepositoryPort } from '../../domain/ports/mensaje-ia.repository.port';
import type { IaProviderPort, MensajeHistorial } from '../../domain/ports/ia-provider.port';
import { CONVERSACION_IA_REPOSITORY } from '../../domain/ports/conversacion-ia.repository.token';
import { MENSAJE_IA_REPOSITORY } from '../../domain/ports/mensaje-ia.repository.token';

const CONTEXTO_SISTEMA = 'Eres AgroBot, el asistente agrícola de AgroSoft. Responde de forma clara y práctica sobre cultivos, plagas, tratamientos y manejo agrícola.';

@Injectable()
export class EnviarMensajeConversacionUseCase {
  constructor(
    @Inject(CONVERSACION_IA_REPOSITORY) private readonly conversaciones: ConversacionIARepositoryPort,
    @Inject(MENSAJE_IA_REPOSITORY) private readonly mensajes: MensajeIARepositoryPort,
    @Inject('IaProviderPort') private readonly iaProvider: IaProviderPort,
  ) {}

  async ejecutar(props: {
    conversacionId: number;
    mensaje: string;
    cantidadImagenes?: number;
  }): Promise<{ respuesta: string }> {
    const conversacion = await this.conversaciones.buscarPorId(props.conversacionId);
    if (!conversacion) throw new NotFoundException('Conversación no encontrada');

    const tieneImagenes = (props.cantidadImagenes ?? 0) > 0;

    await this.mensajes.crear({
      conversacionId: props.conversacionId,
      rol: 'user',
      contenido: props.mensaje,
      tieneImagenes,
      cantidadImagenes: props.cantidadImagenes ?? 0,
    });

    const historialPrevio = await this.mensajes.listarPorConversacion(props.conversacionId);
    const historial: MensajeHistorial[] = [
      { role: 'system', content: CONTEXTO_SISTEMA },
      ...historialPrevio.map((m) => ({
        role: m.obtenerRol(),
        content: m.tieneImagenesAdjuntas()
          ? `${m.obtenerContenido()} [adjuntó ${m.obtenerCantidadImagenes()} imagen(es)]`
          : m.obtenerContenido(),
      })),
    ];

    const respuesta = await this.iaProvider.chat(historial);

    await this.mensajes.crear({
      conversacionId: props.conversacionId,
      rol: 'assistant',
      contenido: respuesta,
    });

    conversacion.tocar();
    await this.conversaciones.guardar(conversacion);

    return { respuesta };
  }
}