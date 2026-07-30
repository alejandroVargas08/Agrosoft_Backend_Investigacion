import { UsuarioPermiso } from '../../../domain/entities/usuario-permiso.entity';
import { UsuarioPermisoOrmEntity } from '../entities/usuario-permiso.orm-entity';

export class UsuarioPermisoMapper {
  static aDominio(orm: UsuarioPermisoOrmEntity): UsuarioPermiso {
    return UsuarioPermiso.reconstruir({
      id: orm.id,
      usuarioId: orm.usuarioId,
      permisoId: orm.permisoId,
      creadoEn: orm.creadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static aPersistencia(dominio: UsuarioPermiso): UsuarioPermisoOrmEntity {
    const orm = new UsuarioPermisoOrmEntity();
    orm.id = dominio.obtenerId();
    orm.usuarioId = dominio.obtenerUsuarioId();
    orm.permisoId = dominio.obtenerPermisoId();
    orm.creadoEn = dominio.obtenerCreadoEn();
    orm.eliminadoEn = dominio.obtenerEliminadoEn();
    return orm;
  }
}