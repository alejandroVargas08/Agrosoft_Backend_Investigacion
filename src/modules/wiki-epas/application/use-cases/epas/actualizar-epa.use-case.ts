import { Inject, Injectable } from '@nestjs/common';
import { Epa } from '../../../domain/entities/epa.entity';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EPA_REPOSITORY_TOKEN } from '../../../domain/ports/epa.repository.token';
import { ActualizarEpaDto } from '../../dto/epas/actualizar-epa.dto';
import { ObtenerEpaUseCase } from './obtener-epa.use-case';

@Injectable()
export class ActualizarEpaUseCase {
  constructor(
    @Inject(EPA_REPOSITORY_TOKEN)
    private readonly epaRepository: EpaRepositoryPort,
    private readonly obtenerEpaUseCase: ObtenerEpaUseCase,
  ) {}

  async execute(id: number, dto: ActualizarEpaDto): Promise<Epa> {
    const actual = await this.obtenerEpaUseCase.execute(id);
    actual.actualizarDatos(dto);
    return this.epaRepository.actualizar(id, actual);
  }
}