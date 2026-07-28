import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Rol } from '../../../domain/entities/rol.entity';
import type { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { ROL_REPOSITORY } from '../../../domain/ports/rol.repository.token';
import { ActualizarRolDto } from '../../dto/roles/actualizar-rol.dto';

@Injectable()
export class ActualizarRolUseCase {
  constructor(
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
  ) {}

  async ejecutar(id: number, dto: ActualizarRolDto): Promise<Rol> {
    const rol = await this.rolRepository.buscarPorId(id);
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    if (dto.nombre) rol.cambiarNombre(dto.nombre);
    if (dto.descripcion !== undefined) rol.cambiarDescripcion(dto.descripcion);

    return await this.rolRepository.actualizar(rol);
  }
}