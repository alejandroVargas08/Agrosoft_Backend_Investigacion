import { RolPermiso } from '../../../domain/entities/rol-permiso.entity';
import { RolPermisoOrmEntity } from '../entities/rol-permiso.orm-entity';

export class RolPermisoMapper {
  static aDominio(orm: RolPermisoOrmEntity): RolPermiso {
    return RolPermiso.reconstruir({
      id: orm.id,
      rolId: orm.rolId,
      permisoId: orm.permisoId,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static aPersistencia(dominio: RolPermiso): RolPermisoOrmEntity {
    const orm = new RolPermisoOrmEntity();
    orm.id = dominio.obtenerId();
    orm.rolId = dominio.obtenerRolId();
    orm.permisoId = dominio.obtenerPermisoId();
    orm.creadoEn = dominio.obtenerCreadoEn();
    orm.actualizadoEn = dominio.obtenerActualizadoEn();
    orm.eliminadoEn = dominio.obtenerEliminadoEn();
    return orm;
  }
}