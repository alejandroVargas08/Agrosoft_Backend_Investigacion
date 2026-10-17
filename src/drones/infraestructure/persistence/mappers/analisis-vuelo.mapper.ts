import { AnalisisVuelo, EstadoAnalisis } from '../../../domain/entities/analisis-vuelo.entity';
import { UmbralesNdvi } from '../../../domain/value-objects/umbrales-ndvi.vo';
import { AnalisisVueloOrmEntity } from '../entities/analisis-vuelo.orm-entity';

export class AnalisisVueloMapper {
  static toDomain(orm: AnalisisVueloOrmEntity): AnalisisVuelo {
    return AnalisisVuelo.desdePersistencia({
      id: orm.id,
      vueloId: orm.vueloId,
      estado: orm.estado as EstadoAnalisis,
      umbrales: UmbralesNdvi.crear(orm.umbrales),
      capturasTotales: orm.capturasTotales,
      capturasProcesadas: orm.capturasProcesadas,
      resumen: orm.resumen,
      mensajeError: orm.mensajeError,
      iniciadoEn: orm.iniciadoEn,
      finalizadoEn: orm.finalizadoEn,
      solicitadoPorUsuarioId: orm.solicitadoPorUsuarioId,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
    });
  }

  static toOrm(analisis: AnalisisVuelo): AnalisisVueloOrmEntity {
    const orm = new AnalisisVueloOrmEntity();
    if (analisis.id) orm.id = analisis.id;
    orm.vueloId = analisis.vueloId;
    orm.estado = analisis.estado;
    orm.umbrales = analisis.umbrales.toProps();
    orm.capturasTotales = analisis.capturasTotales;
    orm.capturasProcesadas = analisis.capturasProcesadas;
    orm.resumen = analisis.resumen;
    orm.mensajeError = analisis.mensajeError;
    orm.iniciadoEn = analisis.iniciadoEn;
    orm.finalizadoEn = analisis.finalizadoEn;
    orm.solicitadoPorUsuarioId = analisis.solicitadoPorUsuarioId;
    return orm;
  }
}
