import { BadRequestException, ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { AnalisisVuelo } from '../../../domain/entities/analisis-vuelo.entity';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/analisis-vuelo.repository.token';
import type { CapturaRepositoryPort } from '../../../domain/ports/captura.repository.port';
import { CAPTURA_REPOSITORY_TOKEN } from '../../../domain/ports/captura.repository.token';
import type { VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../domain/ports/vuelo.repository.token';
import { UmbralesNdvi } from '../../../domain/value-objects/umbrales-ndvi.vo';
import { SolicitarAnalisisDto } from '../../dto/analisis/solicitar-analisis.dto';
import { ObtenerVueloUseCase } from '../vuelos/obtener-vuelo.use-case';
import { ProcesarAnalisisVueloUseCase } from './procesar-analisis-vuelo.use-case';

@Injectable()
export class SolicitarAnalisisVueloUseCase {
  private readonly logger = new Logger(SolicitarAnalisisVueloUseCase.name);

  constructor(
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN)
    private readonly analisisRepository: AnalisisVueloRepositoryPort,
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    @Inject(CAPTURA_REPOSITORY_TOKEN)
    private readonly capturaRepository: CapturaRepositoryPort,
    private readonly obtenerVueloUseCase: ObtenerVueloUseCase,
    private readonly procesarAnalisisVueloUseCase: ProcesarAnalisisVueloUseCase,
  ) {}

  async execute(vueloId: number, dto: SolicitarAnalisisDto, usuario: UsuarioAutenticado): Promise<AnalisisVuelo> {
    const vuelo = await this.obtenerVueloUseCase.execute(vueloId, usuario);
    if (vuelo.estado === 'ANALIZANDO') {
      throw new ConflictException('El vuelo ya tiene un análisis en curso');
    }
    if (!vuelo.puedeAnalizarse()) {
      throw new ConflictException('El vuelo no tiene imágenes cargadas');
    }

    const capturas = await this.capturaRepository.listarPorVuelo(vueloId);
    if (!capturas.some((c) => c.completa)) {
      throw new BadRequestException('El vuelo no tiene capturas con las cuatro bandas multiespectrales (G, R, RE, NIR)');
    }

    let umbrales: UmbralesNdvi;
    try {
      umbrales = UmbralesNdvi.crear({
        sinVegetacion: dto.umbralSinVegetacion,
        estresAlto: dto.umbralEstresAlto,
        saludable: dto.umbralSaludable,
        porcentajeCritico: dto.porcentajeCritico,
      });
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Umbrales inválidos');
    }

    const analisis = await this.analisisRepository.guardar(
      AnalisisVuelo.crear({
        vueloId,
        umbrales,
        usarIa: dto.usarIa ?? true,
        contexto: dto.contexto?.trim() || null,
        solicitadoPorUsuarioId: usuario.id,
      }),
    );

    vuelo.iniciarAnalisis();
    await this.vueloRepository.guardar(vuelo);

    setImmediate(() => {
      this.procesarAnalisisVueloUseCase
        .execute(analisis.id as number)
        .catch((error) => this.logger.error(`Error inesperado en el análisis ${analisis.id}`, error));
    });

    return analisis;
  }
}
