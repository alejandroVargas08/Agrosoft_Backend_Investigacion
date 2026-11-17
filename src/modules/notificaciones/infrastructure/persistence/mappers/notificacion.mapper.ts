import { Notificacion } from '../../../domain/entities/notificacion.entity';
import { NotificacionOrmEntity } from '../entities/notificacion.orm-entity';

export class NotificacionMapper {
  static aDominio(orm: NotificacionOrmEntity): Notificacion {
    return Notificacion.reconstruir({
      id: orm.id,
      usuarioId: orm.usuarioId,
      titulo: orm.titulo,
      mensaje: orm.mensaje,
      tipo: orm.tipo,
      metadata: orm.metadata,
      leida: orm.leida,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static aPersistencia(dominio: Notificacion): NotificacionOrmEntity {
    const orm = new NotificacionOrmEntity();
    orm.id = dominio.obtenerId();
    orm.usuarioId = dominio.obtenerUsuarioId();
    orm.titulo = dominio.obtenerTitulo();
    orm.mensaje = dominio.obtenerMensaje();
    orm.tipo = dominio.obtenerTipo();
    orm.metadata = dominio.obtenerMetadata();
    orm.leida = dominio.obtenerLeida();
    orm.creadoEn = dominio.obtenerCreadoEn();
    orm.actualizadoEn = dominio.obtenerActualizadoEn();
    orm.eliminadoEn = dominio.obtenerEliminadoEn();
    return orm;
  }
}