import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { NotificacionRepositoryPort } from '../../../domain/ports/notificacion.repository.port';
import { Notificacion } from '../../../domain/entities/notificacion.entity';
import { NotificacionOrmEntity } from '../entities/notificacion.orm-entity';
import { NotificacionMapper } from '../mappers/notificacion.mapper';
import { PushService } from '../../push/push.service';

@Injectable()
export class NotificacionRepository implements NotificacionRepositoryPort {
  constructor(
    @InjectRepository(NotificacionOrmEntity)
    private readonly repo: Repository<NotificacionOrmEntity>,
    private readonly push: PushService,
  ) {}

  async guardar(notificacion: Notificacion): Promise<Notificacion> {
    const esNueva = !notificacion.obtenerId();
    const orm = NotificacionMapper.aPersistencia(notificacion);
    const guardado = await this.repo.save(orm);
    const resultado = NotificacionMapper.aDominio(guardado);

    if (esNueva) {
      void this.push.enviarAUsuario(
        resultado.obtenerUsuarioId(),
        resultado.obtenerTitulo(),
        resultado.obtenerMensaje(),
        { tipo: resultado.obtenerTipo(), notificacionId: String(resultado.obtenerId()) },
      );
    }

    return resultado;
  }

  async buscarPorId(id: number): Promise<Notificacion | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? NotificacionMapper.aDominio(orm) : null;
  }

  async buscarPorUsuarioId(usuarioId: number): Promise<Notificacion[]> {
    const orms = await this.repo.find({
      where: { usuarioId },
      order: { creadoEn: 'DESC' },
    });
    return orms.map(NotificacionMapper.aDominio);
  }

  async marcarComoLeida(id: number): Promise<Notificacion> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) throw new NotFoundException('Notificación no encontrada');

    const notificacion = NotificacionMapper.aDominio(orm);
    notificacion.marcarComoLeida();

    const actualizado = await this.repo.save(NotificacionMapper.aPersistencia(notificacion));
    return NotificacionMapper.aDominio(actualizado);
  }

  async eliminar(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
