import { Inject, Injectable } from '@nestjs/common';
import { Captura } from '../../../domain/entities/captura.entity';
import type { CapturaRepositoryPort } from '../../../domain/ports/captura.repository.port';
import { CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/captura.repository.token';
import { ObtenerVueloUseCase } from '../vuelos/obtener-vuelo.use-case';

@Injectable()
export class ListarCapturasPorVueloUseCase {
  constructor(
    @Inject(CAPTURA_REPOSITORY_TOKEN)
    private readonly capturaRepository: CapturaRepositoryPort,
    private readonly obtenerVueloUseCase: ObtenerVueloUseCase,
  ) {}

  async execute(vueloId: number): Promise<Captura[]> {
    await this.obtenerVueloUseCase.execute(vueloId);
    return this.capturaRepository.listarPorVuelo(vueloId);
  }
}
