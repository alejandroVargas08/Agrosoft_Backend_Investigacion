import { Inject, Injectable } from '@nestjs/common';
import type { NotificacionRepositoryPort } from '../../domain/ports/notificacion.repository.port';
import { NOTIFICACION_REPOSITORY } from '../../domain/ports/notificacion.repository.token';
import { Notificacion } from '../../domain/entities/notificacion.entity';

@Injectable()
export class MarcarNotificacionLeidaUseCase {
  constructor(
    @Inject(NOTIFICACION_REPOSITORY)
    private readonly notificacionRepository: NotificacionRepositoryPort,
  ) {}

  async ejecutar(id: number): Promise<Notificacion> {
    return await this.notificacionRepository.marcarComoLeida(id);
  }
}