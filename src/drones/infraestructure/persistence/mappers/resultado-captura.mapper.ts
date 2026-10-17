import { ResultadoCaptura } from '../../../domain/entities/resultado-captura.entity';
import { Coordenada } from '../../../domain/value-objects/coordenada.vo';
import { ClaseVegetacion } from '../../../domain/value-objects/umbrales-ndvi.vo';
import { ResultadoCapturaOrmEntity } from '../entities/resultado-captura.orm-entity';

export class ResultadoCapturaMapper {
  static toDomain(orm: ResultadoCapturaOrmEntity): ResultadoCaptura {
    return ResultadoCaptura.desdePersistencia({
      id: orm.id,
      analisisId: orm.analisisId,
      capturaId: orm.capturaId,
      ubicacion: Coordenada.intentarCrear(orm.latitud, orm.longitud),
      ndvi: orm.ndvi,
      ndre: orm.ndre,
      gndvi: orm.gndvi,
      histogramaNdvi: orm.histogramaNdvi,
      distribucionNdvi: orm.distribucionNdvi,
      clasificacion: orm.clasificacion as ClaseVegetacion,
      esCritica: orm.esCritica,
      creadoEn: orm.creadoEn,
    });
  }

  static toOrm(resultado: ResultadoCaptura): ResultadoCapturaOrmEntity {
    const orm = new ResultadoCapturaOrmEntity();
    if (resultado.id) orm.id = resultado.id;
    orm.analisisId = resultado.analisisId;
    orm.capturaId = resultado.capturaId;
    orm.latitud = resultado.ubicacion?.latitud ?? null;
    orm.longitud = resultado.ubicacion?.longitud ?? null;
    orm.ndviPromedio = resultado.ndvi.promedio;
    orm.clasificacion = resultado.clasificacion;
    orm.esCritica = resultado.esCritica;
    orm.ndvi = resultado.ndvi;
    orm.ndre = resultado.ndre;
    orm.gndvi = resultado.gndvi;
    orm.histogramaNdvi = resultado.histogramaNdvi;
    orm.distribucionNdvi = resultado.distribucionNdvi;
    return orm;
  }
}
