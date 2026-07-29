import { Inject, Injectable } from '@nestjs/common';
import { Permiso } from '../../../domain/entities/permiso.entity';
import type { PermisoRepositoryPort } from '../../../domain/ports/permiso.repository.port';
import { PERMISO_REPOSITORY } from '../../../domain/ports/permiso.repository.token';
import { CrearPermisoDto } from '../../dto/permisos/crear-permiso.dto';

@Injectable()
export class CrearPermisoUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY)
    private readonly permisoRepository: PermisoRepositoryPort,
  ) {}

  async ejecutar(dto: CrearPermisoDto): Promise<Permiso> {
    const existente = await this.permisoRepository.buscarPorNombre(dto.nombre);
    if (existente) {
      throw new Error('Ya existe un permiso con ese nombre');
    }

    const permiso = Permiso.crear({
      id: 0,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });

    return await this.permisoRepository.guardar(permiso);
  }
}