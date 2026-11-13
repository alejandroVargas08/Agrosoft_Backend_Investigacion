import { CultivoAptitud } from '../entities/cultivo-aptitud.entity';
import { EvaluacionTerreno } from '../entities/evaluacion-terreno.entity';

export interface CultivoAptitudRepositoryPort {
  listarActivos(): Promise<CultivoAptitud[]>;
  buscarPorCodigo(codigo: string): Promise<CultivoAptitud | null>;
}

export interface FiltrosEvaluacion {
  loteId?: number;
  loteIdsVisibles: number[] | null;
  usuarioId: number;
}

export interface EvaluacionTerrenoRepositoryPort {
  guardar(evaluacion: EvaluacionTerreno): Promise<EvaluacionTerreno>;
  buscarPorId(id: number): Promise<EvaluacionTerreno | null>;
  listar(filtros: FiltrosEvaluacion): Promise<EvaluacionTerreno[]>;
}

export const CULTIVO_APTITUD_REPOSITORY_TOKEN = Symbol('CULTIVO_APTITUD_REPOSITORY');
export const EVALUACION_TERRENO_REPOSITORY_TOKEN = Symbol('EVALUACION_TERRENO_REPOSITORY');
