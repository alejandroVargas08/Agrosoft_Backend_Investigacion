import { Inject, Injectable } from '@nestjs/common';
import { Epa } from '../../../domain/entities/epa.entity';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EPA_REPOSITORY_TOKEN } from '../../../domain/ports/epa.repository.token';
import { CrearEpaDto } from '../../dto/epas/crear-epa.dto';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-cultivo-wiki.repository.token';
import { resolverCultivosSusceptibles } from './resolver-cultivos-susceptibles';

@Injectable()
export class CrearEpaUseCase {
  constructor(
    @Inject(EPA_REPOSITORY_TOKEN)
    private readonly epaRepository: EpaRepositoryPort,
    @Inject(TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN)
    private readonly tiposCultivo: TipoCultivoWikiRepositoryPort,
  ) {}

  async execute(dto: CrearEpaDto): Promise<Epa> {
    const epa = Epa.crear({
      nombre: dto.nombre,
      tipoEpa: dto.tipoEpa,
      descripcion: dto.descripcion,
      sintomas: dto.sintomas,
      manejoYControl: dto.manejoYControl,
      mesesProbables: dto.mesesProbables,
      temporadas: dto.temporadas,
      notasEstacionalidad: dto.notasEstacionalidad ?? null,
      fotosSintomas: dto.fotosSintomas ?? [],
      fotosGenerales: dto.fotosGenerales ?? [],
      etiquetas: dto.etiquetas ?? [],
      cultivosSusceptibles: await resolverCultivosSusceptibles(dto.cultivosSusceptiblesIds ?? [], this.tiposCultivo),
      creadoPorUsuarioId: dto.creadoPorUsuarioId,
    });

    return this.epaRepository.guardar(epa);
  }
}