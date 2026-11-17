import { Inject, Injectable } from '@nestjs/common';
import type { AlcanceDatos } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
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

  async execute(vueloId: number, alcance: AlcanceDatos): Promise<Captura[]> {
    await this.obtenerVueloUseCase.execute(vueloId, alcance);
    return this.capturaRepository.listarPorVuelo(vueloId);
  }
}
