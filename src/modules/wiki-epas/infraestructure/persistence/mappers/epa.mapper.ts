import { Epa, TipoEpa } from '../../../domain/entities/epa.entity';
import { EpaOrmEntity } from '../entities/epa.orm-entity';
import { TipoCultivoWikiOrmEntity } from '../entities/tipo-cultivo-wiki.orm-entity';

export class EpaMapper {
  static toDomain(orm: EpaOrmEntity): Epa {
    return Epa.desdePersistencia({
      id: orm.id,
      nombre: orm.nombre,
      tipoEpa: orm.tipoEpa as TipoEpa,
      descripcion: orm.descripcion,
      sintomas: orm.sintomas,
      manejoYControl: orm.manejoYControl,
      mesesProbables: orm.mesesProbables,
      temporadas: orm.temporadas,
      notasEstacionalidad: orm.notasEstacionalidad,
      fotosSintomas: orm.fotosSintomas,
      fotosGenerales: orm.fotosGenerales,
      etiquetas: orm.etiquetas,
      cultivosSusceptibles: (orm.cultivosSusceptibles ?? []).map((c) => ({ id: c.id, nombre: c.nombre })),
      creadoPorUsuarioId: orm.creadoPorUsuarioId,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(epa: Epa): EpaOrmEntity {
    const orm = new EpaOrmEntity();
    if (epa.id) orm.id = epa.id;
    orm.nombre = epa.nombre;
    orm.tipoEpa = epa.tipoEpa;
    orm.descripcion = epa.descripcion;
    orm.sintomas = epa.sintomas;
    orm.manejoYControl = epa.manejoYControl;
    orm.mesesProbables = epa.mesesProbables;
    orm.temporadas = epa.temporadas;
    orm.notasEstacionalidad = epa.notasEstacionalidad;
    orm.fotosSintomas = epa.fotosSintomas;
    orm.fotosGenerales = epa.fotosGenerales;
    orm.etiquetas = epa.etiquetas;
    orm.cultivosSusceptibles = epa.cultivosSusceptibles.map((c) => Object.assign(new TipoCultivoWikiOrmEntity(), { id: c.id }));
    orm.creadoPorUsuarioId = epa.creadoPorUsuarioId;
    return orm;
  }
}