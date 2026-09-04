import { SensorAlerta } from '../../../domain/entities/sensor-alerta.entity';
import { TipoAlerta } from '../../../domain/value-objects/rango-operativo.vo';
import { SensorAlertaOrmEntity } from '../entities/sensor-alerta.orm-entity';

export class SensorAlertaMapper {
  static toDomain(orm: SensorAlertaOrmEntity): SensorAlerta {
    return SensorAlerta.desdePersistencia({
      id: orm.id,
      sensorId: orm.sensorId,
      valor: orm.valor,
      umbral: orm.umbral,
      tipo: orm.tipo as TipoAlerta,
      fechaAlerta: orm.fechaAlerta,
      loteId: orm.loteId,
      subLoteId: orm.subLoteId,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
      eliminadoEn: orm.eliminadoEn,
    });
  }

  static toOrm(alerta: SensorAlerta): SensorAlertaOrmEntity {
    const orm = new SensorAlertaOrmEntity();
    if (alerta.id) orm.id = alerta.id;
    orm.sensorId = alerta.sensorId;
    orm.valor = alerta.valor;
    orm.umbral = alerta.umbral;
    orm.tipo = alerta.tipo;
    orm.fechaAlerta = alerta.fechaAlerta;
    orm.loteId = alerta.loteId;
    orm.subLoteId = alerta.subLoteId;
    return orm;
  }
}