import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { NotificacionRepositoryPort } from '../../../domain/ports/notificacion.repository.port';
import { Notificacion } from '../../../domain/entities/notificacion.entity';
import { NotificacionOrmEntity } from '../entities/notificacion.orm-entity';
import { NotificacionMapper } from '../mappers/notificacion.mapper';

@Injectable()
export class NotificacionRepository implements NotificacionRepositoryPort {
  constructor(
    @InjectRepository(NotificacionOrmEntity)
    private readonly repo: Repository<NotificacionOrmEntity>,
  ) {}

  async guardar(notificacion: Notificacion): Promise<Notificacion> {
    const orm = NotificacionMapper.aPersistencia(notificacion);
    const guardado = await this.repo.save(orm);
    return NotificacionMapper.aDominio(guardado);
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