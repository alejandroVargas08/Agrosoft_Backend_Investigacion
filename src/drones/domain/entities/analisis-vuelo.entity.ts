import { DistribucionCobertura } from '../value-objects/cobertura.vo';
import { EstadisticasIndice } from '../value-objects/estadisticas-indice.vo';
import { ResumenInterpretacion } from '../value-objects/interpretacion-ia.vo';
import { DistribucionClases, UmbralesNdvi } from '../value-objects/umbrales-ndvi.vo';

export type EstadoAnalisis = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR';
export type EtapaAnalisis = 'INDICES' | 'INTERPRETACION_IA';

export interface ResumenIndices {
  ndvi: EstadisticasIndice | null;
  ndre: EstadisticasIndice | null;
  gndvi: EstadisticasIndice | null;
  ndwi: EstadisticasIndice | null;
  cobertura: DistribucionCobertura | null;
  distribucionNdvi: DistribucionClases;
  capturasAnalizadas: number;
  capturasCriticas: number;
  capturasOmitidas: number;
}

export interface ResumenAnalisis extends ResumenIndices {
  ia: ResumenInterpretacion;
}

interface AnalisisVueloProps {
  id: number | null;
  vueloId: number;
  estado: EstadoAnalisis;
  etapa: EtapaAnalisis | null;
  umbrales: UmbralesNdvi;
  usarIa: boolean;
  contexto: string | null;
  capturasTotales: number;
  capturasProcesadas: number;
  capturasAInterpretar: number;
  capturasInterpretadas: number;
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

  static crear(
    input: Pick<AnalisisVueloProps, 'vueloId' | 'umbrales' | 'usarIa' | 'contexto' | 'solicitadoPorUsuarioId'>,
  ): AnalisisVuelo {
    return new AnalisisVuelo({
      ...input,
      id: null,
      estado: 'PENDIENTE',
      etapa: null,
      capturasTotales: 0,
      capturasProcesadas: 0,
      capturasAInterpretar: 0,
      capturasInterpretadas: 0,
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
    this.props.etapa = 'INDICES';
    this.props.capturasTotales = capturasTotales;
    this.props.capturasProcesadas = 0;
    this.props.capturasAInterpretar = 0;
    this.props.capturasInterpretadas = 0;
    this.props.iniciadoEn = new Date();
  }

  registrarProgreso(capturasProcesadas: number): void {
    this.props.capturasProcesadas = capturasProcesadas;
  }

  iniciarInterpretacion(capturasAInterpretar: number): void {
    this.props.etapa = 'INTERPRETACION_IA';
    this.props.capturasAInterpretar = capturasAInterpretar;
    this.props.capturasInterpretadas = 0;
  }

  registrarInterpretacion(capturasInterpretadas: number): void {
    this.props.capturasInterpretadas = capturasInterpretadas;
  }

  completar(resumen: ResumenAnalisis): void {
    this.props.estado = 'COMPLETADO';
    this.props.etapa = null;
    this.props.resumen = resumen;
    this.props.finalizadoEn = new Date();
  }

  fallar(mensaje: string): void {
    this.props.estado = 'ERROR';
    this.props.etapa = null;
    this.props.mensajeError = mensaje;
    this.props.finalizadoEn = new Date();
  }

  get id() { return this.props.id; }
  get vueloId() { return this.props.vueloId; }
  get estado() { return this.props.estado; }
  get etapa() { return this.props.etapa; }
  get umbrales() { return this.props.umbrales; }
  get usarIa() { return this.props.usarIa; }
  get contexto() { return this.props.contexto; }
  get capturasTotales() { return this.props.capturasTotales; }
  get capturasProcesadas() { return this.props.capturasProcesadas; }
  get capturasAInterpretar() { return this.props.capturasAInterpretar; }
  get capturasInterpretadas() { return this.props.capturasInterpretadas; }
  get resumen() { return this.props.resumen; }
  get mensajeError() { return this.props.mensajeError; }
  get iniciadoEn() { return this.props.iniciadoEn; }
  get finalizadoEn() { return this.props.finalizadoEn; }
  get solicitadoPorUsuarioId() { return this.props.solicitadoPorUsuarioId; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }

  toProps(): AnalisisVueloProps { return { ...this.props }; }

  toJSON() {
    const pasosTotales = this.props.capturasTotales + this.props.capturasAInterpretar;
    const pasosHechos = this.props.capturasProcesadas + this.props.capturasInterpretadas;
    const progreso =
      this.props.estado === 'COMPLETADO' ? 100 : pasosTotales ? Math.round((pasosHechos * 100) / pasosTotales) : 0;
    return { ...this.props, umbrales: this.props.umbrales.toProps(), progreso };
  }
}
