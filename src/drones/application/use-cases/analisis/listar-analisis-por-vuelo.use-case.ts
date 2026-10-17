import { Inject, Injectable } from '@nestjs/common';
import { AnalisisVuelo } from '../../../domain/entities/analisis-vuelo.entity';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/analisis-vuelo.repository.token';
import { ObtenerVueloUseCase } from '../vuelos/obtener-vuelo.use-case';

@Injectable()
export class ListarAnalisisPorVueloUseCase {
  constructor(
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN)
    private readonly analisisRepository: AnalisisVueloRepositoryPort,
    private readonly obtenerVueloUseCase: ObtenerVueloUseCase,
  ) {}

  async execute(vueloId: number): Promise<AnalisisVuelo[]> {
    await this.obtenerVueloUseCase.execute(vueloId);
    return this.analisisRepository.listarPorVuelo(vueloId);
  }
}
