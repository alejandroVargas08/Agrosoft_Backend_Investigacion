import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { ACCESO_LOTES_PORT } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
import type { AccesoLotesPort } from '../../../../modules/territorio/domain/ports/acceso-lotes.port';
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
    @Inject(ACCESO_LOTES_PORT)
    private readonly accesoLotes: AccesoLotesPort,
    private readonly obtenerDronUseCase: ObtenerDronUseCase,
  ) {}

  async execute(dto: CrearVueloDto, usuario: UsuarioAutenticado): Promise<Vuelo> {
    if (!(await this.accesoLotes.puedeAcceder(usuario, dto.loteId))) {
      throw new NotFoundException(`No existe el lote ${dto.loteId}`);
    }

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
      creadoPorUsuarioId: usuario.id,
    });
    return this.vueloRepository.guardar(vuelo);
  }
}
