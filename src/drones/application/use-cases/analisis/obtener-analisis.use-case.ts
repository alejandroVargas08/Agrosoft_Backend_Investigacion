import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AlcanceDatos } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { AnalisisVuelo } from '../../../domain/entities/analisis-vuelo.entity';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/analisis-vuelo.repository.token';
import { ObtenerVueloUseCase } from '../vuelos/obtener-vuelo.use-case';

@Injectable()
export class ObtenerAnalisisUseCase {
  constructor(
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN)
    private readonly analisisRepository: AnalisisVueloRepositoryPort,
    private readonly obtenerVueloUseCase: ObtenerVueloUseCase,
  ) {}

  async execute(id: number, alcance: AlcanceDatos): Promise<AnalisisVuelo> {
    const analisis = await this.analisisRepository.buscarPorId(id);
    if (!analisis) throw new NotFoundException(`No existe un análisis con id ${id}`);
    try {
      await this.obtenerVueloUseCase.execute(analisis.vueloId, alcance);
    } catch {
      throw new NotFoundException(`No existe un análisis con id ${id}`);
    }
    return analisis;
  }
}
