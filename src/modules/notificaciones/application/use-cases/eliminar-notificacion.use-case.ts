import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NotificacionRepositoryPort } from '../../domain/ports/notificacion.repository.port';
import { NOTIFICACION_REPOSITORY } from '../../domain/ports/notificacion.repository.token';

@Injectable()
export class EliminarNotificacionUseCase {
  constructor(
    @Inject(NOTIFICACION_REPOSITORY)
    private readonly notificacionRepository: NotificacionRepositoryPort,
  ) {}

  async ejecutar(id: number): Promise<void> {
    const notificacion = await this.notificacionRepository.buscarPorId(id);
    if (!notificacion) throw new NotFoundException('Notificación no encontrada');
    await this.notificacionRepository.eliminar(id);
  }
}