export type EstadoVuelo = 'REGISTRADO' | 'CON_IMAGENES' | 'ANALIZANDO' | 'ANALIZADO' | 'ERROR';

interface VueloProps {
  id: number | null;
  dronId: number;
  nombre: string;
  fechaVuelo: Date;
  alturaVueloM: number | null;
  loteId: number;
  subLoteId: number | null;
  cultivoId: number | null;
  observaciones: string | null;
  estado: EstadoVuelo;
  totalCapturas: number;
  creadoPorUsuarioId: number;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class Vuelo {
  private constructor(private props: VueloProps) {}

  static crear(input: Omit<VueloProps, 'id' | 'estado' | 'totalCapturas' | 'eliminadoEn'>): Vuelo {
    return new Vuelo({ ...input, id: null, estado: 'REGISTRADO', totalCapturas: 0, eliminadoEn: null });
  }

  static desdePersistencia(props: VueloProps): Vuelo {
    return new Vuelo(props);
  }

  puedeCargarImagenes(): boolean {
    return this.props.estado !== 'ANALIZANDO';
  }

  puedeAnalizarse(): boolean {
    return ['CON_IMAGENES', 'ANALIZADO', 'ERROR'].includes(this.props.estado) && this.props.totalCapturas > 0;
  }

  registrarImagenes(totalCapturas: number): void {
    if (!this.puedeCargarImagenes()) {
      throw new Error('No se pueden cargar imágenes mientras el vuelo se está analizando');
    }
    this.props.totalCapturas = totalCapturas;
    this.props.estado = 'CON_IMAGENES';
  }

  iniciarAnalisis(): void {
    if (!this.puedeAnalizarse()) {
      throw new Error('El vuelo no está listo para ser analizado');
    }
    this.props.estado = 'ANALIZANDO';
  }

  finalizarAnalisis(): void { this.props.estado = 'ANALIZADO'; }
  marcarError(): void { this.props.estado = 'ERROR'; }
  marcarComoEliminado(): void { this.props.eliminadoEn = new Date(); }

  get id() { return this.props.id; }
  get dronId() { return this.props.dronId; }
  get nombre() { return this.props.nombre; }
  get fechaVuelo() { return this.props.fechaVuelo; }
  get alturaVueloM() { return this.props.alturaVueloM; }
  get loteId() { return this.props.loteId; }
  get subLoteId() { return this.props.subLoteId; }
  get cultivoId() { return this.props.cultivoId; }
  get observaciones() { return this.props.observaciones; }
  get estado() { return this.props.estado; }
  get totalCapturas() { return this.props.totalCapturas; }
  get creadoPorUsuarioId() { return this.props.creadoPorUsuarioId; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): VueloProps { return { ...this.props }; }
  toJSON() { return this.toProps(); }
}
