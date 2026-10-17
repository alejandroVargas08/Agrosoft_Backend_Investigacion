import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query } from '@nestjs/common';
import { ObtenerAnalisisUseCase } from '../../../application/use-cases/analisis/obtener-analisis.use-case';
import { ListarResultadosAnalisisUseCase } from '../../../application/use-cases/analisis/listar-resultados-analisis.use-case';

@Controller('analisis-vuelo')
export class AnalisisVueloController {
  constructor(
    private readonly obtenerAnalisisUseCase: ObtenerAnalisisUseCase,
    private readonly listarResultadosAnalisisUseCase: ListarResultadosAnalisisUseCase,
  ) {}

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerAnalisisUseCase.execute(id);
  }

  @Get(':id/resultados')
  listarResultados(
    @Param('id', ParseIntPipe) id: number,
    @Query('soloCriticas', new ParseBoolPipe({ optional: true })) soloCriticas?: boolean,
  ) {
    return this.listarResultadosAnalisisUseCase.execute(id, soloCriticas ?? false);
  }
}
