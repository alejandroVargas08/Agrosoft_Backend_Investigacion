import { AptitudCultivo } from '../services/evaluador-aptitud.service';
import { DisenoSiembra } from '../services/disenador-siembra.service';
import { PuntoGeo } from '../value-objects/geo';
import { PerfilTerreno } from '../value-objects/perfil-terreno.vo';

export type EstadoEvaluacion = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR';
export type EtapaEvaluacion = 'TOPOGRAFIA' | 'CLIMA_Y_SUELO' | 'COBERTURA' | 'APTITUD' | 'DISENO';

export const ETAPAS_EVALUACION: EtapaEvaluacion[] = ['TOPOGRAFIA', 'CLIMA_Y_SUELO', 'COBERTURA', 'APTITUD', 'DISENO'];

export interface EvaluacionTerrenoProps {
  id: number | null;
  loteId: number | null;
  nombre: string;
  poligono: PuntoGeo[];
  cultivoPreferido: string | null;
  usarDron: boolean;
  usarSatelite: boolean;
  estado: EstadoEvaluacion;
  etapa: EtapaEvaluacion | null;
  perfil: PerfilTerreno | null;
  ranking: AptitudCultivo[] | null;
  disenos: DisenoSiembra[] | null;
  advertencias: string[];
  mensajeError: string | null;
  solicitadoPorUsuarioId: number;
  finalizadoEn: Date | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export class EvaluacionTerreno {
  private constructor(private props: EvaluacionTerrenoProps) {}

  static crear(
    input: Pick<
      EvaluacionTerrenoProps,
      'loteId' | 'nombre' | 'poligono' | 'cultivoPreferido' | 'usarDron' | 'usarSatelite' | 'solicitadoPorUsuarioId'
    >,
  ): EvaluacionTerreno {
    if (input.poligono.length < 3) throw new Error('El terreno necesita al menos 3 vértices');
    return new EvaluacionTerreno({
      ...input,
      id: null,
      estado: 'PENDIENTE',
      etapa: null,
      perfil: null,
      ranking: null,
      disenos: null,
      advertencias: [],
      mensajeError: null,
      finalizadoEn: null,
    });
  }

  static desdePersistencia(props: EvaluacionTerrenoProps): EvaluacionTerreno {
    return new EvaluacionTerreno(props);
  }

  avanzar(etapa: EtapaEvaluacion): void {
    this.props.estado = 'PROCESANDO';
    this.props.etapa = etapa;
  }

  completar(perfil: PerfilTerreno, ranking: AptitudCultivo[], disenos: DisenoSiembra[], advertencias: string[]): void {
    this.props.estado = 'COMPLETADO';
    this.props.etapa = null;
    this.props.perfil = perfil;
    this.props.ranking = ranking;
    this.props.disenos = disenos;
    this.props.advertencias = advertencias;
    this.props.finalizadoEn = new Date();
  }

  fallar(mensaje: string): void {
    this.props.estado = 'ERROR';
    this.props.etapa = null;
    this.props.mensajeError = mensaje;
    this.props.finalizadoEn = new Date();
  }

  get id() { return this.props.id; }
  get loteId() { return this.props.loteId; }
  get nombre() { return this.props.nombre; }
  get poligono() { return this.props.poligono; }
  get cultivoPreferido() { return this.props.cultivoPreferido; }
  get usarDron() { return this.props.usarDron; }
  get usarSatelite() { return this.props.usarSatelite; }
  get estado() { return this.props.estado; }
  get etapa() { return this.props.etapa; }
  get perfil() { return this.props.perfil; }
  get ranking() { return this.props.ranking; }
  get disenos() { return this.props.disenos; }
  get advertencias() { return this.props.advertencias; }
  get mensajeError() { return this.props.mensajeError; }
  get solicitadoPorUsuarioId() { return this.props.solicitadoPorUsuarioId; }
  get finalizadoEn() { return this.props.finalizadoEn; }
  get creadoEn() { return this.props.creadoEn; }

  toProps(): EvaluacionTerrenoProps { return { ...this.props }; }

  toJSON() {
    const progreso =
      this.props.estado === 'COMPLETADO'
        ? 100
        : this.props.etapa
          ? Math.round((ETAPAS_EVALUACION.indexOf(this.props.etapa) * 100) / ETAPAS_EVALUACION.length)
          : 0;
    return { ...this.props, progreso };
  }
}
