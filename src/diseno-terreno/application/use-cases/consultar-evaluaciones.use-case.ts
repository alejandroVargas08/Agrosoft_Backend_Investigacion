import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { AccesoLotesPort } from '../../../modules/territorio/domain/ports/acceso-lotes.port';
import { ACCESO_LOTES_PORT } from '../../../modules/territorio/domain/ports/acceso-lotes.port';
import { EvaluacionTerreno } from '../../domain/entities/evaluacion-terreno.entity';
import type { EvaluacionTerrenoRepositoryPort } from '../../domain/ports/repositorios.port';
import { EVALUACION_TERRENO_REPOSITORY_TOKEN } from '../../domain/ports/repositorios.port';

@Injectable()
export class ObtenerEvaluacionTerrenoUseCase {
  constructor(
    @Inject(EVALUACION_TERRENO_REPOSITORY_TOKEN)
    private readonly evaluacionRepository: EvaluacionTerrenoRepositoryPort,
    @Inject(ACCESO_LOTES_PORT)
    private readonly accesoLotes: AccesoLotesPort,
  ) {}

  async execute(id: number, usuario: UsuarioAutenticado): Promise<EvaluacionTerreno> {
    const evaluacion = await this.evaluacionRepository.buscarPorId(id);
    if (!evaluacion || !(await this.puedeVer(evaluacion, usuario))) {
      throw new NotFoundException(`No existe una evaluación de terreno con id ${id}`);
    }
    return evaluacion;
  }

  private async puedeVer(evaluacion: EvaluacionTerreno, usuario: UsuarioAutenticado): Promise<boolean> {
    if (usuario.verTodo || evaluacion.solicitadoPorUsuarioId === usuario.id) return true;
    return evaluacion.loteId !== null && this.accesoLotes.puedeAcceder(usuario, evaluacion.loteId);
  }
}

@Injectable()
export class ListarEvaluacionesTerrenoUseCase {
  constructor(
    @Inject(EVALUACION_TERRENO_REPOSITORY_TOKEN)
    private readonly evaluacionRepository: EvaluacionTerrenoRepositoryPort,
    @Inject(ACCESO_LOTES_PORT)
    private readonly accesoLotes: AccesoLotesPort,
  ) {}

  async execute(loteId: number | undefined, usuario: UsuarioAutenticado) {
    const evaluaciones = await this.evaluacionRepository.listar({
      loteId,
      loteIdsVisibles: await this.accesoLotes.idsAccesibles(usuario),
      usuarioId: usuario.id,
    });
    return evaluaciones.map((e) => {
      const { perfil, ranking, disenos, poligono, ...resto } = e.toJSON();
      return {
        ...resto,
        mejorCultivo: ranking?.[0] ? { codigo: ranking[0].codigo, nombre: ranking[0].nombre, puntaje: ranking[0].puntaje, clase: ranking[0].clase } : null,
        areaM2: perfil?.areaM2 ?? null,
        fuenteCobertura: perfil?.cobertura?.fuente ?? null,
      };
    });
  }
}
