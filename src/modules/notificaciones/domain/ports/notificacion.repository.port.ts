import { Notificacion } from '../entities/notificacion.entity';

export interface NotificacionRepositoryPort {
  guardar(notificacion: Notificacion): Promise<Notificacion>;
  buscarPorId(id: number): Promise<Notificacion | null>;
  buscarPorUsuarioId(usuarioId: number): Promise<Notificacion[]>;
  marcarComoLeida(id: number): Promise<Notificacion>;
  eliminar(id: number): Promise<void>;
}