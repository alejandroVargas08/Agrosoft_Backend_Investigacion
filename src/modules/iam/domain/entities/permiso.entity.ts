export type EstadoPermiso = 'activo' | 'inactivo';

export class Permiso {
  private constructor(
    private readonly id: number,
    private nombre: string,
    private descripcion: string,
    private estado: EstadoPermiso,
    private readonly creadoEn: Date,
    private actualizadoEn: Date,
    private eliminadoEn: Date | null,
  ) {}

  static crear(props: {
    id: number;
    nombre: string;
    descripcion?: string;
  }): Permiso {
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new Error('El nombre del permiso no puede estar vacío');
    }

    const ahora = new Date();

    return new Permiso(
      props.id,
      props.nombre.trim(),
      props.descripcion ?? '',
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
    estado: EstadoPermiso;
    creadoEn: Date;
    actualizadoEn: Date;
    eliminadoEn: Date | null;
  }): Permiso {
    return new Permiso(
      props.id,
      props.nombre,
      props.descripcion,
      props.estado,
      props.creadoEn,
      props.actualizadoEn,
      props.eliminadoEn,
    );
  }

  obtenerId(): number { return this.id; }
  obtenerNombre(): string { return this.nombre; }
  obtenerDescripcion(): string { return this.descripcion; }
  obtenerEstado(): EstadoPermiso { return this.estado; }
  obtenerCreadoEn(): Date { return this.creadoEn; }
  obtenerActualizadoEn(): Date { return this.actualizadoEn; }
  obtenerEliminadoEn(): Date | null { return this.eliminadoEn; }

  estaActivo(): boolean {
    return this.estado === 'activo' && this.eliminadoEn === null;
  }

  cambiarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length === 0) {
      throw new Error('El nombre no puede estar vacío');
    }
    this.nombre = nuevoNombre.trim();
    this.actualizadoEn = new Date();
  }

  cambiarDescripcion(nuevaDescripcion: string): void {
    this.descripcion = nuevaDescripcion;
    this.actualizadoEn = new Date();
  }

  activar(): void {
    if (this.estado === 'activo') throw new Error('El permiso ya está activo');
    this.estado = 'activo';
    this.actualizadoEn = new Date();
  }

  desactivar(): void {
    if (this.estado === 'inactivo') throw new Error('El permiso ya está inactivo');
    this.estado = 'inactivo';
    this.actualizadoEn = new Date();
  }

  eliminar(): void {
    this.eliminadoEn = new Date();
    this.actualizadoEn = new Date();
  }
}