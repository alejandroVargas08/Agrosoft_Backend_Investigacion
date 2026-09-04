import { Rol } from '../../../domain/entities/rol.entity';
import { RolOrmEntity } from '../entities/rol.orm-entity';

export class RolMapper {
  static aDominio(orm: RolOrmEntity): Rol {
    return Rol.reconstruir({
      id: orm.id,
      nombre: orm.nombre,
      descripcion: orm.descripcion,
      esSistema: orm.esSistema,
      estado: orm.estado,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static aPersistencia(dominio: Rol): RolOrmEntity {
    const orm = new RolOrmEntity();
    orm.id = dominio.obtenerId();
    orm.nombre = dominio.obtenerNombre();
    orm.descripcion = dominio.obtenerDescripcion();
    orm.esSistema = dominio.obtenerEsSistema();
    orm.estado = dominio.obtenerEstado();
    orm.creadoEn = dominio.obtenerCreadoEn();
    orm.actualizadoEn = dominio.obtenerActualizadoEn();
    orm.eliminadoEn = dominio.obtenerEliminadoEn();
    return orm;
  }
}