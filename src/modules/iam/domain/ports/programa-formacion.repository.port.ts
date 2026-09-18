import { ProgramaFormacion } from '../entities/programa-formacion.entity';

export interface ProgramaFormacionRepositoryPort {
  buscarPorId(id: number): Promise<ProgramaFormacion | null>;
  obtenerTodos(): Promise<ProgramaFormacion[]>;
}