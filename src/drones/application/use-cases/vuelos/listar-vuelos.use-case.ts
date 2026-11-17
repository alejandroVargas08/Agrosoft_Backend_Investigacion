import { Inject, Injectable } from '@nestjs/common';
import type { AlcanceDatos } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { AnalisisVuelo, EstadoAnalisis } from '../../../domain/entities/analisis-vuelo.entity';
import { Vuelo } from '../../../domain/entities/vuelo.entity';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/analisis-vuelo.repository.token';
import { ACCESO_LOTES_PORT } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import type { AccesoLotesPort } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import type { FiltrosVuelo, VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';

export interface ResumenUltimoAnalisis {
  id: number;
  estado: EstadoAnalisis;
  progreso: number;
  saludablePct: number | null;
  capturasCriticas: number | null;
  finalizadoEn: Date | null;
}

export type VueloConResumen = ReturnType<Vuelo['toJSON']> & { ultimoAnalisis: ResumenUltimoAnalisis | null };

@Injectable()
export class ListarVuelosUseCase {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN)
    private readonly analisisRepository: AnalisisVueloRepositoryPort,
    @Inject(ACCESO_LOTES_PORT)
    private readonly accesoLotes: AccesoLotesPort,
  ) {}

  async execute(filtros: Omit<FiltrosVuelo, 'loteIds'>, alcance: AlcanceDatos): Promise<VueloConResumen[]> {
    const vuelos = await this.vuelosVisibles(filtros, alcance);
    return Promise.all(
      vuelos.map(async (vuelo) => {
        const analisis = await this.analisisRepository.listarPorVuelo(vuelo.id!);
        return { ...vuelo.toJSON(), ultimoAnalisis: analisis[0] ? this.resumir(analisis[0]) : null };
      }),
    );
  }

  private async vuelosVisibles(filtros: Omit<FiltrosVuelo, 'loteIds'>, alcance: AlcanceDatos): Promise<Vuelo[]> {
    const loteIds = await this.accesoLotes.idsAccesibles(alcance);
    if (loteIds === null) return this.vueloRepository.listar(filtros);
    if (filtros.loteId !== undefined && !loteIds.includes(filtros.loteId)) return [];
    return this.vueloRepository.listar({ ...filtros, loteIds });
  }

  private resumir(analisis: AnalisisVuelo): ResumenUltimoAnalisis {
    const resumen = analisis.resumen;
    return {
      id: analisis.id!,
      estado: analisis.estado,
      progreso: analisis.toJSON().progreso,
      saludablePct: resumen ? resumen.distribucionNdvi.SALUDABLE : null,
      capturasCriticas: resumen ? resumen.capturasCriticas : null,
      finalizadoEn: analisis.finalizadoEn,
    };
  }
}
