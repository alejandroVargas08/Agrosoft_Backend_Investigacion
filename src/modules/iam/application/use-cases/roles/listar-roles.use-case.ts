import { Inject, Injectable } from '@nestjs/common';
import { Rol } from '../../../domain/entities/rol.entity';
import type { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { ROL_REPOSITORY } from '../../../domain/ports/rol.repository.token';

@Injectable()
export class ListarRolesUseCase {
  constructor(
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
  ) {}

  async ejecutar(): Promise<Rol[]> {
    return await this.rolRepository.listarTodos();
  }
}