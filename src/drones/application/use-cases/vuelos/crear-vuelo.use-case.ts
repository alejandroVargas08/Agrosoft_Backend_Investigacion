import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Vuelo } from '../../../domain/entities/vuelo.entity';
import type { VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';
import { CrearVueloDto } from '../../dto/vuelos/crear-vuelo.dto';
import { ObtenerDronUseCase } from '../drones/obtener-dron.use-case';

@Injectable()
export class CrearVueloUseCase {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    private readonly obtenerDronUseCase: ObtenerDronUseCase,
  ) {}

  async execute(dto: CrearVueloDto): Promise<Vuelo> {
    const dron = await this.obtenerDronUseCase.execute(dto.dronId);
    if (!dron.activo) throw new BadRequestException(`El dron ${dron.nombre} está inactivo`);

    const vuelo = Vuelo.crear({
      dronId: dto.dronId,
      nombre: dto.nombre,
      fechaVuelo: new Date(dto.fechaVuelo),
      alturaVueloM: dto.alturaVueloM ?? null,
      loteId: dto.loteId,
      subLoteId: dto.subLoteId ?? null,
      cultivoId: dto.cultivoId ?? null,
      observaciones: dto.observaciones ?? null,
      creadoPorUsuarioId: dto.creadoPorUsuarioId,
    });
    return this.vueloRepository.guardar(vuelo);
  }
}
