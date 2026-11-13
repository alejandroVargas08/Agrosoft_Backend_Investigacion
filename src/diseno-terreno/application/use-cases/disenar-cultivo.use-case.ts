import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { CultivoAptitudRepositoryPort } from '../../domain/ports/repositorios.port';
import { CULTIVO_APTITUD_REPOSITORY_TOKEN } from '../../domain/ports/repositorios.port';
import { DisenadorSiembra, DisenoSiembra } from '../../domain/services/disenador-siembra.service';
import { AptitudCultivo, EvaluadorAptitud } from '../../domain/services/evaluador-aptitud.service';
import { ObtenerEvaluacionTerrenoUseCase } from './consultar-evaluaciones.use-case';

@Injectable()
export class DisenarCultivoUseCase {
  constructor(
    @Inject(CULTIVO_APTITUD_REPOSITORY_TOKEN)
    private readonly cultivoRepository: CultivoAptitudRepositoryPort,
    private readonly obtenerEvaluacion: ObtenerEvaluacionTerrenoUseCase,
  ) {}

  async execute(
    evaluacionId: number,
    codigoCultivo: string,
    usuario: UsuarioAutenticado,
  ): Promise<{ aptitud: AptitudCultivo; diseno: DisenoSiembra }> {
    const evaluacion = await this.obtenerEvaluacion.execute(evaluacionId, usuario);
    if (evaluacion.estado !== 'COMPLETADO' || !evaluacion.perfil) {
      throw new ConflictException('La evaluación todavía no ha terminado');
    }
    const cultivo = await this.cultivoRepository.buscarPorCodigo(codigoCultivo);
    if (!cultivo) throw new NotFoundException(`No existe el cultivo "${codigoCultivo}" en el catálogo`);

    return {
      aptitud: EvaluadorAptitud.evaluarCultivo(evaluacion.perfil, cultivo),
      diseno: DisenadorSiembra.disenar(evaluacion.poligono, evaluacion.perfil, cultivo),
    };
  }
}

@Injectable()
export class ListarCultivosAptitudUseCase {
  constructor(
    @Inject(CULTIVO_APTITUD_REPOSITORY_TOKEN)
    private readonly cultivoRepository: CultivoAptitudRepositoryPort,
  ) {}

  execute() {
    return this.cultivoRepository.listarActivos();
  }
}
