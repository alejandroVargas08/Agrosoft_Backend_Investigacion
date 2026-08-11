import { Inject, Injectable } from '@nestjs/common';
import { Rol } from '../../../domain/entities/rol.entity';
import type { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { ROL_REPOSITORY } from '../../../domain/ports/rol.repository.token';
import { CrearRolDto } from '../../dto/roles/crear-rol.dto';

@Injectable()
export class CrearRolUseCase {
  constructor(
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
  ) {}

  async ejecutar(dto: CrearRolDto): Promise<Rol> {
    const existente = await this.rolRepository.buscarPorNombre(dto.nombre);
    if (existente) {
      throw new Error('Ya existe un rol con ese nombre');
    }

    const rol = Rol.crear({
      id: 0,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? '',
      esSistema: dto.esSistema ?? false,
    });

    return await this.rolRepository.guardar(rol);
  }
}
