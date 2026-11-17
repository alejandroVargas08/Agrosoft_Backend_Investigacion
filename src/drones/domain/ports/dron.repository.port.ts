import { Dron } from '../entities/dron.entity';

export interface DronRepositoryPort {
  guardar(dron: Dron): Promise<Dron>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<Dron | null>;
  listarTodos(): Promise<Dron[]>;
}
