import { Usuario } from '../../../domain/entities/usuario.entity';
import { UsuarioOrmEntity } from '../entities/usuario.orm-entity';

export class UsuarioMapper {
  static aDominio(orm: UsuarioOrmEntity): Usuario {
    return Usuario.reconstruir({
      id: orm.id,
      nombre: orm.nombre,
      apellido: orm.apellido,
      identificacion: orm.identificacion,
      idFicha: orm.idFicha,
      programaFormacionId: orm.programaFormacionId,
      telefono: orm.telefono,
      correo: orm.correo,
      contrasenaHash: orm.contrasenaHash,
      correoVerificadoEn: orm.correoVerificadoEn,
      estado: orm.estado,
      lastLoginAt: orm.lastLoginAt,
      avatarUrl: orm.avatarUrl,
      rolId: orm.rolId,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static aPersistencia(dominio: Usuario): UsuarioOrmEntity {
    const orm = new UsuarioOrmEntity();
    orm.id = dominio.obtenerId();
    orm.nombre = dominio.obtenerNombre();
    orm.apellido = dominio.obtenerApellido();
    orm.identificacion = dominio.obtenerIdentificacion();
    orm.idFicha = dominio.obtenerIdFicha();
    orm.programaFormacionId = dominio.obtenerProgramaFormacionId();
    orm.telefono = dominio.obtenerTelefono();
    orm.correo = dominio.obtenerCorreo();
    orm.contrasenaHash = dominio.obtenerContrasenaHash();
    orm.correoVerificadoEn = dominio.obtenerCorreoVerificadoEn();
    orm.estado = dominio.obtenerEstado();
    orm.lastLoginAt = dominio.obtenerLastLoginAt();
    orm.avatarUrl = dominio.obtenerAvatarUrl();
    orm.rolId = dominio.obtenerRolId();
    orm.creadoEn = dominio.obtenerCreadoEn();
    orm.actualizadoEn = dominio.obtenerActualizadoEn();
    orm.eliminadoEn = dominio.obtenerEliminadoEn();
    return orm;
  }
}