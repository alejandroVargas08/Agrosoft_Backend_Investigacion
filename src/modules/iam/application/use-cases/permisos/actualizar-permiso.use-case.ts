import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Permiso } from '../../../domain/entities/permiso.entity';
import type { PermisoRepositoryPort } from '../../../domain/ports/permiso.repository.port';
import { PERMISO_REPOSITORY } from '../../../domain/ports/permiso.repository.token';
import { ActualizarPermisoDto } from '../../dto/permisos/actualizar-permiso.dto';

@Injectable()
export class ActualizarPermisoUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY)
    private readonly permisoRepository: PermisoRepositoryPort,
  ) {}

  async ejecutar(id: number, dto: ActualizarPermisoDto): Promise<Permiso> {
    const permiso = await this.permisoRepository.buscarPorId(id);
    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    if (dto.nombre) permiso.cambiarNombre(dto.nombre);
    if (dto.descripcion !== undefined) permiso.cambiarDescripcion(dto.descripcion);

    return await this.permisoRepository.actualizar(permiso);
  }
}