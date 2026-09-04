import { IotGlobalConfig } from '../../../domain/entities/iot-global-config.entity';
import { ConexionAgente } from '../../../domain/value-objects/conexion-agente.vo';
import { CredencialesAgente } from '../../../domain/value-objects/credenciales-agente.vo';
import { IotGlobalConfigOrmEntity } from '../entities/iot-global-config.orm-entity';

export class IotGlobalConfigMapper {
  static toDomain(orm: IotGlobalConfigOrmEntity): IotGlobalConfig {
    return IotGlobalConfig.desdePersistencia({
      id: orm.id,
      nombre: orm.nombre,
      conexion: ConexionAgente.crear(orm.agente, orm.puerto, orm.protocolo),
      credenciales: CredencialesAgente.crear(orm.nombreUsuario, orm.contrasena),
      prefijoTema: orm.prefijoTema,
      temasPredeterminados: orm.temasPredeterminados,
      temasPersonalizados: orm.temasPersonalizados,
      loteId: orm.loteId,
      subLoteId: orm.subLoteId,
      activo: orm.activo,
      sensoresPredeterminadosInicializados: orm.sensoresPredeterminadosInicializados,
      autoDiscover: orm.autoDiscover,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(config: IotGlobalConfig): IotGlobalConfigOrmEntity {
    const orm = new IotGlobalConfigOrmEntity();
    if (config.id) orm.id = config.id;
    orm.nombre = config.nombre;
    orm.agente = config.conexion.agente;
    orm.puerto = config.conexion.puerto;
    orm.protocolo = config.conexion.protocolo;
    orm.nombreUsuario = config.credenciales.nombreUsuario;
    orm.contrasena = config.credenciales.obtenerContrasenaReal();
    orm.prefijoTema = config.prefijoTema;
    orm.temasPredeterminados = config.temasPredeterminados;
    orm.temasPersonalizados = config.temasPersonalizados;
    orm.loteId = config.loteId;
    orm.subLoteId = config.subLoteId;
    orm.activo = config.activo;
    orm.sensoresPredeterminadosInicializados = config.sensoresPredeterminadosInicializados;
    orm.autoDiscover = config.autoDiscover;
    return orm;
  }
}