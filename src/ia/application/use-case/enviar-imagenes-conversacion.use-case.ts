import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ConversacionIARepositoryPort } from '../../domain/ports/conversacion-ia.repository.port';
import type { MensajeIARepositoryPort } from '../../domain/ports/mensaje-ia.repository.port';
import type { IaProviderPort, MensajeHistorial } from '../../domain/ports/ia-provider.port';
import { CONVERSACION_IA_REPOSITORY } from '../../domain/ports/conversacion-ia.repository.token';
import { MENSAJE_IA_REPOSITORY } from '../../domain/ports/mensaje-ia.repository.token';
import { PoliticaPersistenciaMensajesService } from '../services/politica-persistencia-mensajes.service';

const CONTEXTO_SISTEMA = 'Eres AgroBot, el asistente agrícola de AgroSoft. Responde de forma clara y práctica sobre cultivos, plagas, tratamientos y manejo agrícola.';
const INSTRUCCION_IMAGEN = 'Analiza la imagen como agrónomo: identifica el cultivo si puedes, describe síntomas visibles (plagas, enfermedades, deficiencias, estrés hídrico) y da recomendaciones prácticas. Si la imagen no es clara, dilo.';
const MAX_MENSAJES_HISTORIAL = 12;

@Injectable()
export class EnviarImagenesConversacionUseCase {
  constructor(
    @Inject(CONVERSACION_IA_REPOSITORY) private readonly conversaciones: ConversacionIARepositoryPort,
    @Inject(MENSAJE_IA_REPOSITORY) private readonly mensajes: MensajeIARepositoryPort,
    @Inject('IaProviderPort') private readonly iaProvider: IaProviderPort,
    private readonly politica: PoliticaPersistenciaMensajesService,
  ) {}

  async ejecutar(props: {
    conversacionId: number;
    mensaje: string;
    imagenes?: string[];
    cantidadImagenes?: number;
    contexto?: string;
    tuvoDatos?: boolean;
  }): Promise<{ respuesta: string; guardado: boolean }> {
    const conversacion = await this.conversaciones.buscarPorId(props.conversacionId);
    if (!conversacion) throw new NotFoundException('Conversación no encontrada');

    const imagenes = (props.imagenes ?? [])
      .map((img) => img.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, ''))
      .filter((img) => img.length > 0);
    const cantidadImagenes = imagenes.length || (props.cantidadImagenes ?? 0);
    const tieneImagenes = cantidadImagenes > 0;

    let respuesta: string;
    if (imagenes.length > 0) {
      const prompt = `${CONTEXTO_SISTEMA}\n\n${INSTRUCCION_IMAGEN}\n\nPregunta del usuario: ${props.mensaje}`;
      respuesta = await this.iaProvider.analizarImagenes(imagenes, prompt);
    } else {
      const historialPrevio = await this.mensajes.listarPorConversacion(props.conversacionId);
      const historial: MensajeHistorial[] = [
        { role: 'system', content: props.contexto ? `${CONTEXTO_SISTEMA}\n\n${props.contexto}` : CONTEXTO_SISTEMA },
        ...historialPrevio.slice(-MAX_MENSAJES_HISTORIAL).map((m) => ({
          role: m.obtenerRol(),
          content: m.tieneImagenesAdjuntas()
            ? `${m.obtenerContenido()} [adjuntó ${m.obtenerCantidadImagenes()} imagen(es)]`
            : m.obtenerContenido(),
        })),
        { role: 'user', content: props.mensaje },
      ];
      respuesta = await this.iaProvider.chat(historial);
    }

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
      conversacion.tocar();
      await this.conversaciones.guardar(conversacion);
    }

    return { respuesta, guardado: guardar };
  }
}
