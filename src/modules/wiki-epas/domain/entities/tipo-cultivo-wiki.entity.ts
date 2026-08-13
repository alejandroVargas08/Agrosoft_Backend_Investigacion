interface TipoCultivoWikiProps {
  id: number | null;
  nombre: string;
  descripcion: string;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class TipoCultivoWiki {
  private constructor(private props: TipoCultivoWikiProps) {}

  static crear(input: Omit<TipoCultivoWikiProps, 'id' | 'eliminadoEn'>): TipoCultivoWiki {
    return new TipoCultivoWiki({ ...input, id: null, eliminadoEn: null });
  }

  static desdePersistencia(props: TipoCultivoWikiProps): TipoCultivoWiki {
    return new TipoCultivoWiki(props);
  }

  actualizarDatos(cambios: Partial<Pick<TipoCultivoWikiProps, 'nombre' | 'descripcion'>>): void {
    this.props = { ...this.props, ...cambios };
  }

  marcarComoEliminado(): void { this.props.eliminadoEn = new Date(); }

  get id() { return this.props.id; }
  get nombre() { return this.props.nombre; }
  get descripcion() { return this.props.descripcion; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): TipoCultivoWikiProps { return { ...this.props }; }
}