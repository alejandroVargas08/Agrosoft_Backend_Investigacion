import { Inject, Injectable } from '@nestjs/common';
import { Epa } from '../../../domain/entities/epa.entity';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EPA_REPOSITORY_TOKEN } from '../../../domain/ports/epa.repository.token';
import { CrearEpaDto } from '../../dto/epas/crear-epa.dto';

@Injectable()
export class CrearEpaUseCase {
  constructor(
    @Inject(EPA_REPOSITORY_TOKEN)
    private readonly epaRepository: EpaRepositoryPort,
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
      creadoPorUsuarioId: dto.creadoPorUsuarioId,
    });

    return this.epaRepository.guardar(epa);
  }
}