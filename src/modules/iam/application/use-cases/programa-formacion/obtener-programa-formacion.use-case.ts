import { Inject, Injectable } from '@nestjs/common';
import type { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../domain/ports/programa-formacion.repository.token';
import { ProgramaFormacion } from '../../../domain/entities/programa-formacion.entity';

@Injectable()
export class ObtenerProgramaFormacionUseCase {
  constructor(
    @Inject(PROGRAMA_FORMACION_REPOSITORY)
    private readonly repo: ProgramaFormacionRepositoryPort,
  ) {}

  async ejecutar(id: number): Promise<ProgramaFormacion | null> {
    return this.repo.buscarPorId(id);
  }
}