import { Inject, Injectable } from '@nestjs/common';
import type { UsuarioPermisoRepositoryPort } from '../../../domain/ports/usuario-permiso.repository.port';
import { USUARIO_PERMISO_REPOSITORY } from '../../../domain/ports/usuario-permiso.repository.token';
import { UsuarioPermiso } from '../../../domain/entities/usuario-permiso.entity';
import { AsignarUsuarioPermisoDto } from '../../dto/usuario-permisos/asignar-usuario-permiso.dto';

@Injectable()
export class AsignarUsuarioPermisoUseCase {
  constructor(
    @Inject(USUARIO_PERMISO_REPOSITORY)
    private readonly repository: UsuarioPermisoRepositoryPort,
  ) {}

  async ejecutar(dto: AsignarUsuarioPermisoDto): Promise<UsuarioPermiso> {
    const existente = await this.repository.buscarPorUsuarioYPermiso(dto.usuarioId, dto.permisoId);
    if (existente) 
        throw new Error('Este permiso ya está asignado a este usuario');
    
    const usuarioPermiso = UsuarioPermiso.crear({ id: 0, usuarioId: dto.usuarioId, permisoId: dto.permisoId });
    return await this.repository.guardar(usuarioPermiso);
  }
}
