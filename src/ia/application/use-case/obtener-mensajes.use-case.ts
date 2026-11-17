import { Inject, Injectable } from '@nestjs/common';
import type { MensajeIARepositoryPort } from '../../domain/ports/mensaje-ia.repository.port';
import { MENSAJE_IA_REPOSITORY } from '../../domain/ports/mensaje-ia.repository.token';

@Injectable()
export class ObtenerMensajesUseCase {
  constructor(
    @Inject(MENSAJE_IA_REPOSITORY) private readonly mensajes: MensajeIARepositoryPort,
  ) {}

  async ejecutar(conversacionId: number) {
    return this.mensajes.listarPorConversacion(conversacionId);
  }
}