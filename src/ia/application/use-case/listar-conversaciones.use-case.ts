import { Inject, Injectable } from '@nestjs/common';
import type { ConversacionIARepositoryPort } from '../../domain/ports/conversacion-ia.repository.port';
import { CONVERSACION_IA_REPOSITORY } from '../../domain/ports/conversacion-ia.repository.token';

@Injectable()
export class ListarConversacionesUseCase {
  constructor(
    @Inject(CONVERSACION_IA_REPOSITORY) private readonly conversaciones: ConversacionIARepositoryPort,
  ) {}

  async ejecutar(usuarioId: number) {
    return this.conversaciones.listarPorUsuario(usuarioId);
  }
}