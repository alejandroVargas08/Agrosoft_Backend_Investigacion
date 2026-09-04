export type EstadoRol = 'activo' | 'inactivo';
export class Rol {
  private constructor(
    private readonly id: number,
    private nombre: string,
    private descripcion: string,
    private esSistema: boolean,
    private estado: EstadoRol,
    private readonly creadoEn: Date,
    private actualizadoEn: Date,
    private eliminadoEn: Date | null,
  ) {}

  static crear(props: {
    id: number;
    nombre: string;
    descripcion: string;
    esSistema?: boolean;
  }): Rol {
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new Error('El nombre del rol no puede estar vacío');
    }

    const ahora = new Date();

    return new Rol(
      props.id,
      props.nombre.trim(),
      props.descripcion ?? '',
      props.esSistema ?? false,
      'activo',
      ahora,
      ahora,
      null,
    );
  }

  static reconstruir(props: {
    id: number;
    nombre: string;
    descripcion: string;
    esSistema: boolean;
    estado: EstadoRol;
    creadoEn: Date;
    actualizadoEn: Date;
    eliminadoEn: Date | null;
  }): Rol {
    return new Rol(
      props.id,
      props.nombre,
      props.descripcion,
      props.esSistema,
      props.estado,
      props.creadoEn,
      props.actualizadoEn,
      props.eliminadoEn,
    );
  }

  obtenerId(): number { return this.id; }
  obtenerNombre(): string { return this.nombre; }
  obtenerDescripcion(): string { return this.descripcion; }
  obtenerEsSistema(): boolean { return this.esSistema; }
  obtenerEstado(): EstadoRol { return this.estado; }
  obtenerCreadoEn(): Date { return this.creadoEn; }
  obtenerActualizadoEn(): Date { return this.actualizadoEn; }
  obtenerEliminadoEn(): Date | null { return this.eliminadoEn; }

  estaActivo(): boolean {
    return this.estado === 'activo' && this.eliminadoEn === null;
  }

  cambiarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length === 0) {
      throw new Error('El nombre del rol no puede estar vacío');
    }
    this.nombre = nuevoNombre.trim();
    this.actualizadoEn = new Date();
  }

  cambiarDescripcion(nuevaDescripcion: string): void {
    this.descripcion = nuevaDescripcion;
    this.actualizadoEn = new Date();
  }

  activar(): void {
    if (this.estado === 'activo') throw new Error('El rol ya está activo');
    this.estado = 'activo';
    this.actualizadoEn = new Date();
  }

  desactivar(): void {
    if (this.estado === 'inactivo') throw new Error('El rol ya está inactivo');
    this.estado = 'inactivo';
    this.actualizadoEn = new Date();
  }

  eliminar(): void {
    this.eliminadoEn = new Date();
    this.actualizadoEn = new Date();
  }
}