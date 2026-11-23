import { TipoAlerta } from '../value-objects/rango-operativo.vo';

export type ResolucionAlerta = 'normalizada' | 'descartada';
export type EstadoAlerta = 'activa' | ResolucionAlerta;

interface SensorAlertaProps {
  id: number | null;
  sensorId: number;
  valor: number;
  umbral: number;
  tipo: TipoAlerta;
  fechaAlerta: Date;
  loteId: number | null;
  subLoteId: number | null;
  resueltaEn?: Date | null;
  resolucion?: ResolucionAlerta | null;
  valorNormalizado?: number | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class SensorAlerta {
  private constructor(private props: SensorAlertaProps) {}

  static crear(input: Omit<SensorAlertaProps, 'id' | 'eliminadoEn'>): SensorAlerta {
    return new SensorAlerta({ ...input, id: null, eliminadoEn: null, resueltaEn: null, resolucion: null, valorNormalizado: null });
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
  get resueltaEn() { return this.props.resueltaEn ?? null; }
  get resolucion() { return this.props.resolucion ?? null; }
  get valorNormalizado() { return this.props.valorNormalizado ?? null; }

  get estado(): EstadoAlerta { return this.props.resolucion ?? 'activa'; }
  estaActiva(): boolean { return !this.props.resueltaEn; }

  /** La lectura volvio al rango: la alerta se cierra sola con ese valor. */
  normalizar(valor: number, fecha: Date): void {
    if (!this.estaActiva()) return;
    this.props = { ...this.props, resueltaEn: fecha, resolucion: 'normalizada', valorNormalizado: valor };
  }

  /** Alguien la cierra a mano: se conserva en el historial, no se borra. */
  descartar(): void {
    if (!this.estaActiva()) return;
    this.props = { ...this.props, resueltaEn: new Date(), resolucion: 'descartada' };
  }

  toProps(): SensorAlertaProps { return { ...this.props }; }

  // Sin esto, Nest serializa la entidad como {"props":{...}}
  toJSON() { return { ...this.toProps(), estado: this.estado }; }
}