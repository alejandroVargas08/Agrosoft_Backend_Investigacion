import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Autenticado } from '../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';
import { RequierePermisos } from '../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator';
import { UsuarioActual } from '../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { SolicitarEvaluacionDto } from '../../application/dto/solicitar-evaluacion.dto';
import { SolicitarEvaluacionTerrenoUseCase } from '../../application/use-cases/solicitar-evaluacion-terreno.use-case';
import { ListarEvaluacionesTerrenoUseCase, ObtenerEvaluacionTerrenoUseCase } from '../../application/use-cases/consultar-evaluaciones.use-case';
import { DisenarCultivoUseCase, ListarCultivosAptitudUseCase } from '../../application/use-cases/disenar-cultivo.use-case';

export const PERMISOS_TERRENO = {
  VER: 'terreno.ver',
  EVALUAR: 'terreno.evaluar',
} as const;

@Controller('diseno-terreno')
@Autenticado()
export class DisenoTerrenoController {
  constructor(
    private readonly solicitarEvaluacion: SolicitarEvaluacionTerrenoUseCase,
    private readonly obtenerEvaluacion: ObtenerEvaluacionTerrenoUseCase,
    private readonly listarEvaluaciones: ListarEvaluacionesTerrenoUseCase,
    private readonly disenarCultivo: DisenarCultivoUseCase,
    private readonly listarCultivos: ListarCultivosAptitudUseCase,
  ) {}

  @Get('cultivos')
  @RequierePermisos(PERMISOS_TERRENO.VER)
  cultivos() {
    return this.listarCultivos.execute();
  }

  @Post('evaluaciones')
  @HttpCode(HttpStatus.ACCEPTED)
  @RequierePermisos(PERMISOS_TERRENO.EVALUAR)
  solicitar(@Body() dto: SolicitarEvaluacionDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.solicitarEvaluacion.execute(dto, usuario);
  }

  @Get('evaluaciones')
  @RequierePermisos(PERMISOS_TERRENO.VER)
  listar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query('loteId', new ParseIntPipe({ optional: true })) loteId?: number,
  ) {
    return this.listarEvaluaciones.execute(loteId, usuario);
  }

  @Get('evaluaciones/:id')
  @RequierePermisos(PERMISOS_TERRENO.VER)
  obtener(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.obtenerEvaluacion.execute(id, usuario);
  }

  @Get('evaluaciones/:id/diseno/:cultivo')
  @RequierePermisos(PERMISOS_TERRENO.VER)
  diseno(
    @Param('id', ParseIntPipe) id: number,
    @Param('cultivo') cultivo: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.disenarCultivo.execute(id, cultivo, usuario);
  }
}
