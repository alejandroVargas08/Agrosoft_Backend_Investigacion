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

  obtenerId(): number { return this.id; }
  obtenerNombre(): string { return this.nombre; }
  obtenerTipo(): string { return this.tipo; }
  obtenerFicha(): string { return this.ficha; }
  obtenerFechaInicio(): Date { return this.fechaInicio; }
  obtenerFechaFin(): Date { return this.fechaFin; }
  obtenerEstado(): string { return this.estado; }
}