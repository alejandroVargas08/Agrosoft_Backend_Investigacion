import { Epa } from '../entities/epa.entity';

export interface EpaRepositoryPort {
  guardar(epa: Epa): Promise<Epa>;
  actualizar(id: number, epa: Epa): Promise<Epa>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<Epa | null>;
  listarTodos(): Promise<Epa[]>;
}