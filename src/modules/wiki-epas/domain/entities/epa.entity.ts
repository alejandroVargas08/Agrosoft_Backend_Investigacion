export type TipoEpa = 'ENFERMEDAD' | 'PLAGA' | 'ARVENSE';

interface EpaProps {
  id: number | null;
  nombre: string;
  tipoEpa: TipoEpa;
  descripcion: string;
  sintomas: string;
  manejoYControl: string;
  mesesProbables: number[];
  temporadas: string[];
  notasEstacionalidad: string | null;
  fotosSintomas: string[];
  fotosGenerales: string[];
  etiquetas: string[];
  creadoPorUsuarioId: number;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class Epa {
  private constructor(private props: EpaProps) {
    this.validar();
  }

  static crear(input: Omit<EpaProps, 'id' | 'eliminadoEn'>): Epa {
    return new Epa({ ...input, id: null, eliminadoEn: null });
  }

  static desdePersistencia(props: EpaProps): Epa {
    return new Epa(props);
  }

  private validar(): void {
    const fueraDeRango = this.props.mesesProbables.some((mes) => mes < 1 || mes > 12);
    if (fueraDeRango) {
      throw new Error('Cada mes en mesesProbables debe estar entre 1 y 12');
    }
  }

  actualizarDatos(cambios: Partial<Omit<EpaProps, 'id' | 'creadoPorUsuarioId' | 'creadoEn' | 'eliminadoEn'>>): void {
    this.props = { ...this.props, ...cambios };
    this.validar();
  }

  marcarComoEliminado(): void { this.props.eliminadoEn = new Date(); }

  get id() { return this.props.id; }
  get nombre() { return this.props.nombre; }
  get tipoEpa() { return this.props.tipoEpa; }
  get descripcion() { return this.props.descripcion; }
  get sintomas() { return this.props.sintomas; }
  get manejoYControl() { return this.props.manejoYControl; }
  get mesesProbables() { return this.props.mesesProbables; }
  get temporadas() { return this.props.temporadas; }
  get notasEstacionalidad() { return this.props.notasEstacionalidad; }
  get fotosSintomas() { return this.props.fotosSintomas; }
  get fotosGenerales() { return this.props.fotosGenerales; }
  get etiquetas() { return this.props.etiquetas; }
  get creadoPorUsuarioId() { return this.props.creadoPorUsuarioId; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): EpaProps { return { ...this.props }; }
}