import { Inject, Injectable } from '@nestjs/common';
import { ResultadoCaptura } from '../../../domain/entities/resultado-captura.entity';
import type { ResultadoCapturaRepositoryPort } from '../../../domain/ports/resultado-captura.repository.port';
import { RESULTADO_CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/resultado-captura.repository.token';
import { ObtenerAnalisisUseCase } from './obtener-analisis.use-case';

@Injectable()
export class ListarResultadosAnalisisUseCase {
  constructor(
    @Inject(RESULTADO_CAPTURA_REPOSITORY_TOKEN)
    private readonly resultadoRepository: ResultadoCapturaRepositoryPort,
    private readonly obtenerAnalisisUseCase: ObtenerAnalisisUseCase,
  ) {}

  async execute(analisisId: number, soloCriticas = false): Promise<ResultadoCaptura[]> {
    await this.obtenerAnalisisUseCase.execute(analisisId);
    return this.resultadoRepository.listarPorAnalisis(analisisId, soloCriticas);
  }
}
