import { RolPermiso } from '../entities/rol-permiso.entity';

export interface RolPermisoRepositoryPort {
  guardar(rolPermiso: RolPermiso): Promise<RolPermiso>;
  buscarPorRolId(rolId: number): Promise<RolPermiso[]>;
  buscarPorRolYPermiso(rolId: number, permisoId: number): Promise<RolPermiso | null>;
  eliminar(rolId: number, permisoId: number): Promise<void>;
}