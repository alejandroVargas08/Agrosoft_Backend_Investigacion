import { EstadisticasIndice } from '../value-objects/estadisticas-indice.vo';
import { DistribucionClases, UmbralesNdvi } from '../value-objects/umbrales-ndvi.vo';

export type EstadoAnalisis = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR';

export interface ResumenAnalisis {
  ndvi: EstadisticasIndice | null;
  ndre: EstadisticasIndice | null;
  gndvi: EstadisticasIndice | null;
  distribucionNdvi: DistribucionClases;
  capturasAnalizadas: number;
  capturasCriticas: number;
  capturasOmitidas: number;
}

interface AnalisisVueloProps {
  id: number | null;
  vueloId: number;
  estado: EstadoAnalisis;
  umbrales: UmbralesNdvi;
  capturasTotales: number;
  capturasProcesadas: number;
  resumen: ResumenAnalisis | null;
  mensajeError: string | null;
  iniciadoEn: Date | null;
  finalizadoEn: Date | null;
  solicitadoPorUsuarioId: number;
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export class AnalisisVuelo {
  private constructor(private props: AnalisisVueloProps) {}

  static crear(input: Pick<AnalisisVueloProps, 'vueloId' | 'umbrales' | 'solicitadoPorUsuarioId'>): AnalisisVuelo {
    return new AnalisisVuelo({
      ...input,
      id: null,
      estado: 'PENDIENTE',
      capturasTotales: 0,
      capturasProcesadas: 0,
      resumen: null,
      mensajeError: null,
      iniciadoEn: null,
      finalizadoEn: null,
    });
  }

  static desdePersistencia(props: AnalisisVueloProps): AnalisisVuelo {
    return new AnalisisVuelo(props);
  }

  iniciar(capturasTotales: number): void {
    this.props.estado = 'PROCESANDO';
    this.props.capturasTotales = capturasTotales;
    this.props.capturasProcesadas = 0;
    this.props.iniciadoEn = new Date();
  }

  registrarProgreso(capturasProcesadas: number): void {
    this.props.capturasProcesadas = capturasProcesadas;
  }

  completar(resumen: ResumenAnalisis): void {
    this.props.estado = 'COMPLETADO';
    this.props.resumen = resumen;
    this.props.finalizadoEn = new Date();
  }

  fallar(mensaje: string): void {
    this.props.estado = 'ERROR';
    this.props.mensajeError = mensaje;
    this.props.finalizadoEn = new Date();
  }

  get id() { return this.props.id; }
  get vueloId() { return this.props.vueloId; }
  get estado() { return this.props.estado; }
  get umbrales() { return this.props.umbrales; }
  get capturasTotales() { return this.props.capturasTotales; }
  get capturasProcesadas() { return this.props.capturasProcesadas; }
  get resumen() { return this.props.resumen; }
  get mensajeError() { return this.props.mensajeError; }
  get iniciadoEn() { return this.props.iniciadoEn; }
  get finalizadoEn() { return this.props.finalizadoEn; }
  get solicitadoPorUsuarioId() { return this.props.solicitadoPorUsuarioId; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }

  toProps(): AnalisisVueloProps { return { ...this.props }; }

  toJSON() {
    const porcentaje = this.props.capturasTotales
      ? Math.round((this.props.capturasProcesadas * 100) / this.props.capturasTotales)
      : 0;
    return { ...this.props, umbrales: this.props.umbrales.toProps(), progreso: porcentaje };
  }
}

