import { Inject, Injectable } from '@nestjs/common';
import type { RolPermisoRepositoryPort } from '../../../domain/ports/rol-permiso.repository.port';
import { ROL_PERMISO_REPOSITORY } from '../../../domain/ports/rol-permiso.repository.token';
import { RolPermiso } from '../../../domain/entities/rol-permiso.entity';
import { AsignarRolPermisoDto } from '../../dto/rol-permisos/asignar-rol-permiso.dto';

@Injectable()
export class AsignarRolPermisoUseCase {
  constructor(
    @Inject(ROL_PERMISO_REPOSITORY)
    private readonly repository: RolPermisoRepositoryPort,
  ) {}

  async ejecutar(dto: AsignarRolPermisoDto): Promise<RolPermiso> {
    const existente = await this.repository.buscarPorRolYPermiso(dto.rolId, dto.permisoId);
    if (existente) 
      throw new Error('Este permiso ya está asignado a este rol');

    const rolPermiso = RolPermiso.crear({ id: 0, rolId: dto.rolId, permisoId: dto.permisoId });
    return await this.repository.guardar(rolPermiso);
  }
}