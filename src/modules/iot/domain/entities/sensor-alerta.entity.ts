import { TipoAlerta } from '../value-objects/rango-operativo.vo';

interface SensorAlertaProps {
  id: number | null;
  sensorId: number;
  valor: number;
  umbral: number;
  tipo: TipoAlerta;
  fechaAlerta: Date;
  loteId: number | null;
  subLoteId: number | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class SensorAlerta {
  private constructor(private props: SensorAlertaProps) {}

  static crear(input: Omit<SensorAlertaProps, 'id' | 'eliminadoEn'>): SensorAlerta {
    return new SensorAlerta({ ...input, id: null, eliminadoEn: null });
  }

  static desdePersistencia(props: SensorAlertaProps): SensorAlerta {
    return new SensorAlerta(props);
  }

  get id() { return this.props.id; }
  get sensorId() { return this.props.sensorId; }
  get valor() { return this.props.valor; }
  get umbral() { return this.props.umbral; }
  get tipo() { return this.props.tipo; }
  get fechaAlerta() { return this.props.fechaAlerta; }
  get loteId() { return this.props.loteId; }
  get subLoteId() { return this.props.subLoteId; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): SensorAlertaProps { return { ...this.props }; }
}