import { UsuarioPermiso } from '../entities/usuario-permiso.entity';

export interface UsuarioPermisoRepositoryPort {
  guardar(usuarioPermiso: UsuarioPermiso): Promise<UsuarioPermiso>;
  buscarPorUsuarioId(usuarioId: number): Promise<UsuarioPermiso[]>;
  buscarPorUsuarioYPermiso(usuarioId: number, permisoId: number): Promise<UsuarioPermiso | null>;
  eliminarPorUsuarioYPermiso(usuarioId: number, permisoId: number): Promise<void>;
}