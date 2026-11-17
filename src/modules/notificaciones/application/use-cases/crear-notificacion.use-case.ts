import { Inject, Injectable } from '@nestjs/common';
import type { NotificacionRepositoryPort } from '../../domain/ports/notificacion.repository.port';
import { NOTIFICACION_REPOSITORY } from '../../domain/ports/notificacion.repository.token';
import { Notificacion } from '../../domain/entities/notificacion.entity';
import { CrearNotificacionDto } from '../dto/crear-notificacion.dto';

@Injectable()
export class CrearNotificacionUseCase {
  constructor(
    @Inject(NOTIFICACION_REPOSITORY)
    private readonly notificacionRepository: NotificacionRepositoryPort,
  ) {}

  async ejecutar(dto: CrearNotificacionDto): Promise<Notificacion> {
    const notificacion = Notificacion.crear({
      id: 0,
      usuarioId: dto.usuarioId,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      tipo: dto.tipo,
      metadata: dto.metadata ?? null,
    });

    return await this.notificacionRepository.guardar(notificacion);
  }
}