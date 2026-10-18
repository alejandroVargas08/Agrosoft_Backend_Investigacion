import { Inject, Injectable } from '@nestjs/common';
import { Dron } from '../../../domain/entities/dron.entity';
import type { DronRepositoryPort } from '../../../domain/ports/dron.repository.port';
import { DRON_REPOSITORY_TOKEN } from '../../../domain/ports/dron.repository.token';
import { CrearDronDto } from '../../dto/drones/crear-dron.dto';

@Injectable()
export class CrearDronUseCase {
  constructor(
    @Inject(DRON_REPOSITORY_TOKEN)
    private readonly dronRepository: DronRepositoryPort,
  ) {}

  async execute(dto: CrearDronDto, usuarioId: number): Promise<Dron> {
    const dron = Dron.crear({
      nombre: dto.nombre,
      modelo: dto.modelo,
      numeroSerie: dto.numeroSerie ?? null,
      tipoCamara: dto.tipoCamara,
      tieneRtk: dto.tieneRtk ?? false,
      creadoPorUsuarioId: usuarioId,
    });
    return this.dronRepository.guardar(dron);
  }
}
