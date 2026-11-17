export class RolPermiso {
  private constructor(
    private readonly id: number,
    private readonly rolId: number,
    private readonly permisoId: number,
    private readonly creadoEn: Date,
    private actualizadoEn: Date,
    private eliminadoEn: Date | null,
  ) {}

  static crear(props: { 
    id: number; rolId: number; permisoId: number 
    }): RolPermiso {
    const ahora = new Date();
    return new RolPermiso(props.id, props.rolId, props.permisoId, ahora, ahora, null);
  }

  static reconstruir(props: {
    id: number;
    rolId: number;
    permisoId: number;
    creadoEn: Date;
    actualizadoEn: Date;
    eliminadoEn: Date | null;
  }): RolPermiso {
    return new RolPermiso(
      props.id,
      props.rolId,
      props.permisoId,
      props.creadoEn,
      props.actualizadoEn,
      props.eliminadoEn,
    );
  }

  obtenerId(): number { return this.id; }
  obtenerRolId(): number { return this.rolId; }
  obtenerPermisoId(): number { return this.permisoId; }
  obtenerCreadoEn(): Date { return this.creadoEn; }
  obtenerActualizadoEn(): Date { return this.actualizadoEn; }
  obtenerEliminadoEn(): Date | null { return this.eliminadoEn; }
}