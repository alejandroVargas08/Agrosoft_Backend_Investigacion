export class ProgramaFormacion {
  private constructor(
    private readonly id: number,
    private nombre: string,
    private tipo: string,
    private ficha: string,
    private fechaInicio: Date,
    private fechaFin: Date,
    private estado: string,
  ) {}

  static crear(props: {
    id: number;
    nombre: string;
    tipo: string;
    ficha: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
  }): ProgramaFormacion {
    return new ProgramaFormacion(
      props.id,
      props.nombre,
      props.tipo,
      props.ficha,
      props.fechaInicio,
      props.fechaFin,
      props.estado,
    );
  }

  actualizar(cambios: { nombre?: string; tipo?: string; ficha?: string; fechaInicio?: Date; fechaFin?: Date; estado?: string }): void {
    if (cambios.nombre !== undefined) this.nombre = cambios.nombre;
    if (cambios.tipo !== undefined) this.tipo = cambios.tipo;
    if (cambios.ficha !== undefined) this.ficha = cambios.ficha;
    if (cambios.fechaInicio !== undefined) this.fechaInicio = cambios.fechaInicio;
    if (cambios.fechaFin !== undefined) this.fechaFin = cambios.fechaFin;
    if (cambios.estado !== undefined) this.estado = cambios.estado;
    if (this.fechaFin < this.fechaInicio) throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
  }

  obtenerId(): number { return this.id; }
  obtenerNombre(): string { return this.nombre; }
  obtenerTipo(): string { return this.tipo; }
  obtenerFicha(): string { return this.ficha; }
  obtenerFechaInicio(): Date { return this.fechaInicio; }
  obtenerFechaFin(): Date { return this.fechaFin; }
  obtenerEstado(): string { return this.estado; }
}
