import { Permiso } from '../entities/permiso.entity';

export interface PermisoRepositoryPort {
  guardar(permiso: Permiso): Promise<Permiso>;
  actualizar(permiso: Permiso): Promise<Permiso>;
  buscarPorId(id: number): Promise<Permiso | null>;
  buscarPorNombre(nombre: string): Promise<Permiso | null>;
  listarTodos(): Promise<Permiso[]>;
  eliminar(id: number): Promise<void>;
}