interface TipoSensorProps {
  id: number | null;
  nombre: string;
  unidad: string;
  decimales: number;
  descripcion: string | null;
  imagen: string | null;
  ttlMinutos: number;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class TipoSensor {
  private constructor(private props: TipoSensorProps) {}

  static crear(input: Omit<TipoSensorProps, 'id' | 'eliminadoEn'>): TipoSensor {
    return new TipoSensor({ ...input, id: null, eliminadoEn: null });
  }

  static desdePersistencia(props: TipoSensorProps): TipoSensor {
    return new TipoSensor(props);
  }

  actualizarDatos(cambios: Partial<Pick<TipoSensorProps, 'nombre' | 'unidad' | 'decimales' | 'descripcion' | 'imagen' | 'ttlMinutos'>>): void {
    this.props = { ...this.props, ...cambios };
  }

  marcarComoEliminado(): void { this.props.eliminadoEn = new Date(); }

  get id() { return this.props.id; }
  get nombre() { return this.props.nombre; }
  get unidad() { return this.props.unidad; }
  get decimales() { return this.props.decimales; }
  get descripcion() { return this.props.descripcion; }
  get imagen() { return this.props.imagen; }
  get ttlMinutos() { return this.props.ttlMinutos; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): TipoSensorProps { return { ...this.props }; }
}