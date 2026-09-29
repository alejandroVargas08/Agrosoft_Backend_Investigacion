export class ConversacionIA {
  private constructor(
    private readonly id: number,
    private readonly usuarioId: number,
    private titulo: string,
    private readonly creadoEn: Date,
    private actualizadoEn: Date,
  ) {}

  static crear(props: { id: number; usuarioId: number; titulo: string }): ConversacionIA {
    const ahora = new Date();
    return new ConversacionIA(props.id, props.usuarioId, props.titulo, ahora, ahora);
  }

  static reconstruir(props: {
    id: number; usuarioId: number; titulo: string; creadoEn: Date; actualizadoEn: Date;
  }): ConversacionIA {
    return new ConversacionIA(props.id, props.usuarioId, props.titulo, props.creadoEn, props.actualizadoEn);
  }

  obtenerId(): number { return this.id; }
  obtenerUsuarioId(): number { return this.usuarioId; }
  obtenerTitulo(): string { return this.titulo; }
  obtenerCreadoEn(): Date { return this.creadoEn; }
  obtenerActualizadoEn(): Date { return this.actualizadoEn; }

  renombrar(nuevoTitulo: string): void {
    this.titulo = nuevoTitulo.trim().slice(0, 80);
    this.actualizadoEn = new Date();
  }

  tocar(): void {
    this.actualizadoEn = new Date();
  }
}