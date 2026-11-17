import { AnalisisVuelo, EstadoAnalisis, EtapaAnalisis } from '../../../domain/entities/analisis-vuelo.entity';
import { UmbralesNdvi } from '../../../domain/value-objects/umbrales-ndvi.vo';
import { AnalisisVueloOrmEntity } from '../entities/analisis-vuelo.orm-entity';

export class AnalisisVueloMapper {
  static toDomain(orm: AnalisisVueloOrmEntity): AnalisisVuelo {
    return AnalisisVuelo.desdePersistencia({
      id: orm.id,
      vueloId: orm.vueloId,
      estado: orm.estado as EstadoAnalisis,
      etapa: (orm.etapa as EtapaAnalisis | null) ?? null,
      umbrales: UmbralesNdvi.crear(orm.umbrales),
      usarIa: orm.usarIa,
      contexto: orm.contexto,
      capturasTotales: orm.capturasTotales,
      capturasProcesadas: orm.capturasProcesadas,
      capturasAInterpretar: orm.capturasAInterpretar,
      capturasInterpretadas: orm.capturasInterpretadas,
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
    orm.etapa = analisis.etapa;
    orm.umbrales = analisis.umbrales.toProps();
    orm.usarIa = analisis.usarIa;
    orm.contexto = analisis.contexto;
    orm.capturasTotales = analisis.capturasTotales;
    orm.capturasProcesadas = analisis.capturasProcesadas;
    orm.capturasAInterpretar = analisis.capturasAInterpretar;
    orm.capturasInterpretadas = analisis.capturasInterpretadas;
    orm.resumen = analisis.resumen;
    orm.mensajeError = analisis.mensajeError;
    orm.iniciadoEn = analisis.iniciadoEn;
    orm.finalizadoEn = analisis.finalizadoEn;
    orm.solicitadoPorUsuarioId = analisis.solicitadoPorUsuarioId;
    return orm;
  }
}
