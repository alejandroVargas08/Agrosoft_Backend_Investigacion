import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ConversacionIARepositoryPort } from '../../domain/ports/conversacion-ia.repository.port';
import type { MensajeIARepositoryPort } from '../../domain/ports/mensaje-ia.repository.port';
import type { IaProviderPort } from '../../domain/ports/ia-provider.port';
import { CONVERSACION_IA_REPOSITORY } from '../../domain/ports/conversacion-ia.repository.token';
import { MENSAJE_IA_REPOSITORY } from '../../domain/ports/mensaje-ia.repository.token';

@Injectable()
export class EnviarImagenesConversacionUseCase {
  constructor(
    @Inject(CONVERSACION_IA_REPOSITORY) private readonly conversaciones: ConversacionIARepositoryPort,
    @Inject(MENSAJE_IA_REPOSITORY) private readonly mensajes: MensajeIARepositoryPort,
    @Inject('IaProviderPort') private readonly iaProvider: IaProviderPort,
  ) {}

  async ejecutar(props: {
    conversacionId: number;
    imagenes: string[];
    prompt: string;
  }): Promise<{ respuesta: string }> {
    const conversacion = await this.conversaciones.buscarPorId(props.conversacionId);
    if (!conversacion) throw new NotFoundException('Conversación no encontrada');

    await this.mensajes.crear({
      conversacionId: props.conversacionId,
      rol: 'user',
      contenido: props.prompt,
      tieneImagenes: true,
      cantidadImagenes: props.imagenes.length,
    });

    const respuesta = await this.iaProvider.analizarImagenes(props.imagenes, props.prompt);

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