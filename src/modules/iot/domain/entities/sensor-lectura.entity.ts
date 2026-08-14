interface SensorLecturaProps {
  id: number | null;
  sensorId: number;
  valor: string;
  fechaLectura: Date;
  unidad: string;
  observaciones: string | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class SensorLectura {
  private constructor(private props: SensorLecturaProps) {}

  static crear(input: Omit<SensorLecturaProps, 'id' | 'eliminadoEn'>): SensorLectura {
    return new SensorLectura({ ...input, id: null, eliminadoEn: null });
  }

  static desdePersistencia(props: SensorLecturaProps): SensorLectura {
    return new SensorLectura(props);
  }

  get id() { return this.props.id; }
  get sensorId() { return this.props.sensorId; }
  get valor() { return this.props.valor; }
  get fechaLectura() { return this.props.fechaLectura; }
  get unidad() { return this.props.unidad; }
  get observaciones() { return this.props.observaciones; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): SensorLecturaProps { return { ...this.props }; }
}