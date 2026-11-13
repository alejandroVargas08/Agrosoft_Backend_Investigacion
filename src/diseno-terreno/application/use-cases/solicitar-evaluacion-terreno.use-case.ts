import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { AccesoLotesPort } from '../../../modules/territorio/domain/ports/acceso-lotes.port';
import { ACCESO_LOTES_PORT } from '../../../modules/territorio/domain/ports/acceso-lotes.port';
import type { LoteRepositoryPort } from '../../../modules/territorio/domain/ports/lote.repository.port';
import { LOTE_REPOSITORY_PORT } from '../../../modules/territorio/domain/ports/lote.repository.port';
import { EvaluacionTerreno } from '../../domain/entities/evaluacion-terreno.entity';
import type { CultivoAptitudRepositoryPort, EvaluacionTerrenoRepositoryPort } from '../../domain/ports/repositorios.port';
import { CULTIVO_APTITUD_REPOSITORY_TOKEN, EVALUACION_TERRENO_REPOSITORY_TOKEN } from '../../domain/ports/repositorios.port';
import { areaPoligonoM2, PuntoGeo } from '../../domain/value-objects/geo';
import { SolicitarEvaluacionDto } from '../dto/solicitar-evaluacion.dto';
import { ProcesarEvaluacionTerrenoUseCase } from './procesar-evaluacion-terreno.use-case';

const AREA_MAXIMA_M2 = 5_000_000;

@Injectable()
export class SolicitarEvaluacionTerrenoUseCase {
  private readonly logger = new Logger(SolicitarEvaluacionTerrenoUseCase.name);

  constructor(
    @Inject(EVALUACION_TERRENO_REPOSITORY_TOKEN)
    private readonly evaluacionRepository: EvaluacionTerrenoRepositoryPort,
    @Inject(CULTIVO_APTITUD_REPOSITORY_TOKEN)
    private readonly cultivoRepository: CultivoAptitudRepositoryPort,
    @Inject(LOTE_REPOSITORY_PORT)
    private readonly loteRepository: LoteRepositoryPort,
    @Inject(ACCESO_LOTES_PORT)
    private readonly accesoLotes: AccesoLotesPort,
    private readonly procesarEvaluacion: ProcesarEvaluacionTerrenoUseCase,
  ) {}

  async execute(dto: SolicitarEvaluacionDto, usuario: UsuarioAutenticado): Promise<EvaluacionTerreno> {
    if (!dto.loteId && !dto.poligono) {
      throw new BadRequestException('Envía un loteId o un poligono con al menos 3 puntos');
    }

    let poligono: PuntoGeo[];
    let nombre = dto.nombre?.trim();

    if (dto.loteId) {
      const lote = await this.loteRepository.buscarPorId(dto.loteId);
      if (!lote || !(await this.accesoLotes.puedeAcceder(usuario, dto.loteId))) {
        throw new NotFoundException(`No existe un lote con id ${dto.loteId}`);
      }
      poligono = dto.poligono ?? lote.poligono.vertices.map((v) => ({ lat: v.lat, lng: v.lng }));
      nombre ||= `Lote ${lote.nombre}`;
    } else {
      poligono = dto.poligono!.map((p) => ({ lat: p.lat, lng: p.lng }));
    }

    const area = areaPoligonoM2(poligono);
    if (area < 1) throw new BadRequestException('El polígono no encierra un área válida');
    if (area > AREA_MAXIMA_M2) throw new BadRequestException('El terreno supera 500 ha; divídelo en lotes más pequeños');

    if (dto.cultivoPreferido && !(await this.cultivoRepository.buscarPorCodigo(dto.cultivoPreferido))) {
      throw new BadRequestException(`No existe el cultivo "${dto.cultivoPreferido}" en el catálogo`);
    }

    const evaluacion = await this.evaluacionRepository.guardar(
      EvaluacionTerreno.crear({
        loteId: dto.loteId ?? null,
        nombre: nombre || `Terreno de ${(area / 10_000).toFixed(2)} ha`,
        poligono,
        cultivoPreferido: dto.cultivoPreferido ?? null,
        usarDron: dto.usarDron ?? true,
        usarSatelite: dto.usarSatelite ?? true,
        solicitadoPorUsuarioId: usuario.id,
      }),
    );

    setImmediate(() => {
      this.procesarEvaluacion
        .execute(evaluacion.id as number)
        .catch((error) => this.logger.error(`Error inesperado en la evaluación ${evaluacion.id}`, error));
    });

    return evaluacion;
  }
}
