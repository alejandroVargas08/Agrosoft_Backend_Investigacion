import { Rol } from '../entities/rol.entity';

export interface RolRepositoryPort {
  guardar(rol: Rol): Promise<Rol>;
  actualizar(rol: Rol): Promise<Rol>;
  buscarPorId(id: number): Promise<Rol | null>;
  buscarPorNombre(nombre: string): Promise<Rol | null>;
  listarTodos(): Promise<Rol[]>;
  eliminar(id: number): Promise<void>;
}