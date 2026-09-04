export type TipoEpaEnum = 'ENFERMEDAD' | 'PLAGA' | 'ARVENSE';

interface WikiTipoEpaProps {
  id: number | null;
  nombre: string;
  descripcion: string;
  tipoEpaEnum: TipoEpaEnum;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class WikiTipoEpa {
  private constructor(private props: WikiTipoEpaProps) {}

  static crear(input: Omit<WikiTipoEpaProps, 'id' | 'eliminadoEn'>): WikiTipoEpa {
    return new WikiTipoEpa({ ...input, id: null, eliminadoEn: null });
  }

  static desdePersistencia(props: WikiTipoEpaProps): WikiTipoEpa {
    return new WikiTipoEpa(props);
  }

  actualizarDatos(cambios: Partial<Pick<WikiTipoEpaProps, 'nombre' | 'descripcion' | 'tipoEpaEnum'>>): void {
    this.props = { ...this.props, ...cambios };
  }

  marcarComoEliminado(): void { this.props.eliminadoEn = new Date(); }

  get id() { return this.props.id; }
  get nombre() { return this.props.nombre; }
  get descripcion() { return this.props.descripcion; }
  get tipoEpaEnum() { return this.props.tipoEpaEnum; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): WikiTipoEpaProps { return { ...this.props }; }
}