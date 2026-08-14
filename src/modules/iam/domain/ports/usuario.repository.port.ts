import { Usuario } from '../entities/usuario.entity';

export interface UsuarioRepositoryPort {
  obtenerTodos(): Promise<Usuario[]>;
  guardar(usuario: Usuario): Promise<Usuario>;
  actualizar(usuario: Usuario): Promise<Usuario>; 
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarPorCorreo(correo: string): Promise<Usuario | null>;
  eliminar(id: number): Promise<void>;
}