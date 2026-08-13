import { Permiso } from '../../../domain/entities/permiso.entity';
import { PermisoOrmEntity } from '../entities/permiso.orm-entity';

export class PermisoMapper {
  static aDominio(orm: PermisoOrmEntity): Permiso {
    return Permiso.reconstruir({
      id: orm.id,
      nombre: orm.nombre,
      descripcion: orm.descripcion,
      estado: orm.estado,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static aPersistencia(dominio: Permiso): PermisoOrmEntity {
    const orm = new PermisoOrmEntity();
    orm.id = dominio.obtenerId();
    orm.nombre = dominio.obtenerNombre();
    orm.descripcion = dominio.obtenerDescripcion();
    orm.estado = dominio.obtenerEstado();
    orm.creadoEn = dominio.obtenerCreadoEn();
    orm.actualizadoEn = dominio.obtenerActualizadoEn();
    orm.eliminadoEn = dominio.obtenerEliminadoEn();
    return orm;
  }
}