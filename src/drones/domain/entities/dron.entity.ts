export type TipoCamara = 'RGB' | 'MULTIESPECTRAL';

interface DronProps {
  id: number | null;
  nombre: string;
  modelo: string;
  numeroSerie: string | null;
  tipoCamara: TipoCamara;
  tieneRtk: boolean;
  activo: boolean;
  creadoPorUsuarioId: number;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class Dron {
  private constructor(private props: DronProps) {}

  static crear(input: Omit<DronProps, 'id' | 'activo' | 'eliminadoEn'>): Dron {
    return new Dron({ ...input, id: null, activo: true, eliminadoEn: null });
  }

  static desdePersistencia(props: DronProps): Dron {
    return new Dron(props);
  }

  activar(): void { this.props.activo = true; }
  desactivar(): void { this.props.activo = false; }

  get id() { return this.props.id; }
  get nombre() { return this.props.nombre; }
  get modelo() { return this.props.modelo; }
  get numeroSerie() { return this.props.numeroSerie; }
  get tipoCamara() { return this.props.tipoCamara; }
  get tieneRtk() { return this.props.tieneRtk; }
  get activo() { return this.props.activo; }
  get creadoPorUsuarioId() { return this.props.creadoPorUsuarioId; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): DronProps { return { ...this.props }; }
  toJSON() { return this.toProps(); }
}

