import { Inject, Injectable } from '@nestjs/common';
import { RolPermiso } from '../../../domain/entities/rol-permiso.entity';
import { RolPermisoRepositoryPort } from '../../../domain/ports/permiso.repository.port';
import { ROL_PERMISO_REPOSITORY } from '../../../domain/ports/rol-permiso.repository.token';
import { AsignarRolPermisoDto } from '../../dto/';

@Injectable()
export class AsignarRolPermisoUseCase {
  constructor(
    @Inject(ROL_PERMISO_REPOSITORY)
    private readonly rolPermisoRepository: RolPermisoRepositoryPort,
  ) {}

  async ejecutar(dto: AsignarRolPermisoDto): Promise<RolPermiso> {
    const existente = await this.rolPermisoRepository.buscarPorRolYPermiso(
      dto.rolId,
      dto.permisoId,
    );
    if (existente) {
      throw new Error('Este permiso ya está asignado a este rol');
    }

    const rolPermiso = RolPermiso.crear({
      id: 0,
      rolId: dto.rolId,
      permisoId: dto.permisoId,
    });

    return await this.rolPermisoRepository.guardar(rolPermiso);
  }
  //aqui vamos con este error 
}