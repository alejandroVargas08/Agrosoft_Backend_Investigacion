import { ResultadoCaptura } from '../entities/resultado-captura.entity';

export interface ResultadoCapturaRepositoryPort {
  guardar(resultado: ResultadoCaptura): Promise<ResultadoCaptura>;
  listarPorAnalisis(analisisId: number, soloCriticas: boolean): Promise<ResultadoCaptura[]>;
}
