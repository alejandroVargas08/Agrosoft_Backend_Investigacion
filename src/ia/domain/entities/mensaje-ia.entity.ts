export type RolMensajeIA = 'user' | 'assistant';

export class MensajeIA {
  private constructor(
    private readonly id: number,
    private readonly conversacionId: number,
    private readonly rol: RolMensajeIA,
    private readonly contenido: string,
    private readonly tieneImagenes: boolean,
    private readonly cantidadImagenes: number,
    private readonly creadoEn: Date,
  ) {}

  static crear(props: {
    id: number; conversacionId: number; rol: RolMensajeIA; contenido: string;
    tieneImagenes?: boolean; cantidadImagenes?: number;
  }): MensajeIA {
    return new MensajeIA(
      props.id, props.conversacionId, props.rol, props.contenido,
      props.tieneImagenes ?? false, props.cantidadImagenes ?? 0, new Date(),
    );
  }

  static reconstruir(props: {
    id: number; conversacionId: number; rol: RolMensajeIA; contenido: string;
    tieneImagenes: boolean; cantidadImagenes: number; creadoEn: Date;
  }): MensajeIA {
    return new MensajeIA(
      props.id, props.conversacionId, props.rol, props.contenido,
      props.tieneImagenes, props.cantidadImagenes, props.creadoEn,
    );
  }

  obtenerId(): number { return this.id; }
  obtenerConversacionId(): number { return this.conversacionId; }
  obtenerRol(): RolMensajeIA { return this.rol; }
  obtenerContenido(): string { return this.contenido; }
  tieneImagenesAdjuntas(): boolean { return this.tieneImagenes; }
  obtenerCantidadImagenes(): number { return this.cantidadImagenes; }
  obtenerCreadoEn(): Date { return this.creadoEn; }
}