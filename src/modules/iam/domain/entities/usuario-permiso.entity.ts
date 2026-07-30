
export class UsuarioPermiso {
  private constructor(
    private readonly id: number,
    private readonly usuarioId: number,
    private readonly permisoId: number,
    private readonly creadoEn: Date,
    private eliminadoEn: Date | null,
  ) {}

  static crear(props: { id: number; usuarioId: number; permisoId: number }): UsuarioPermiso {
    return new UsuarioPermiso(props.id, props.usuarioId, props.permisoId, new Date(), null);
  }

  static reconstruir(props: {
    id: number; usuarioId: number; permisoId: number; creadoEn: Date; eliminadoEn: Date | null;
  }): UsuarioPermiso {
    return new UsuarioPermiso(props.id, props.usuarioId, props.permisoId, props.creadoEn, props.eliminadoEn);
  }

  obtenerId(): number { return this.id; }
  obtenerUsuarioId(): number { return this.usuarioId; }
  obtenerPermisoId(): number { return this.permisoId; }
  obtenerCreadoEn(): Date { return this.creadoEn; }
  obtenerEliminadoEn(): Date | null { return this.eliminadoEn; }
}