import { Captura } from '../../../domain/entities/captura.entity';
import { Coordenada } from '../../../domain/value-objects/coordenada.vo';
import { CapturaOrmEntity } from '../entities/captura.orm-entity';

export class CapturaMapper {
  static toDomain(orm: CapturaOrmEntity): Captura {
    return Captura.desdePersistencia({
      id: orm.id,
      vueloId: orm.vueloId,
      claveCaptura: orm.claveCaptura,
      numeroCaptura: orm.numeroCaptura,
      ubicacion: Coordenada.intentarCrear(orm.latitud, orm.longitud),
      altitudRelativaM: orm.altitudRelativaM,
      inclinacionCamaraGrados: orm.inclinacionCamaraGrados ?? null,
      tomadaEn: orm.tomadaEn,
      archivos: orm.archivos ?? {},
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(captura: Captura): CapturaOrmEntity {
    const orm = new CapturaOrmEntity();
    if (captura.id) orm.id = captura.id;
    orm.vueloId = captura.vueloId;
    orm.claveCaptura = captura.claveCaptura;
    orm.numeroCaptura = captura.numeroCaptura;
    orm.latitud = captura.ubicacion?.latitud ?? null;
    orm.longitud = captura.ubicacion?.longitud ?? null;
    orm.altitudRelativaM = captura.altitudRelativaM;
    orm.inclinacionCamaraGrados = captura.inclinacionCamaraGrados;
    orm.tomadaEn = captura.tomadaEn;
    orm.archivos = captura.archivos;
    return orm;
  }
}
