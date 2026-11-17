import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query } from '@nestjs/common';
import { Autenticado } from '../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';
import { RequierePermisos } from '../../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator';
import { UsuarioActual } from '../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { ObtenerAnalisisUseCase } from '../../../application/use-cases/analisis/obtener-analisis.use-case';
import { ListarResultadosAnalisisUseCase } from '../../../application/use-cases/analisis/listar-resultados-analisis.use-case';
import { PERMISOS_DRONES } from '../permisos-drones';

@Controller('analisis-vuelo')
@Autenticado(PERMISOS_DRONES.VER_VUELOS)
export class AnalisisVueloController {
  constructor(
    private readonly obtenerAnalisisUseCase: ObtenerAnalisisUseCase,
    private readonly listarResultadosAnalisisUseCase: ListarResultadosAnalisisUseCase,
  ) {}

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.obtenerAnalisisUseCase.execute(id, usuario);
  }

  @Get(':id/resultados')
  listarResultados(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query('soloCriticas', new ParseBoolPipe({ optional: true })) soloCriticas?: boolean,
  ) {
    return this.listarResultadosAnalisisUseCase.execute(id, soloCriticas ?? false, usuario);
  }
}
