import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AsociarEpaTipoCultivoWikiUseCase } from '../../../application/use-cases/epa-tipos-cultivos-wiki/asociar-epa-tipo-cultivo-wiki.use-case';
import { DesasociarEpaTipoCultivoWikiUseCase } from '../../../application/use-cases/epa-tipos-cultivos-wiki/desasociar-epa-tipo-cultivo-wiki.use-case';
import { ListarTiposCultivoPorEpaUseCase } from '../../../application/use-cases/epa-tipos-cultivos-wiki/listar-tipos-cultivo-por-epa.use-case';
import { ListarEpasPorTipoCultivoUseCase } from '../../../application/use-cases/epa-tipos-cultivos-wiki/listar-epas-por-tipo-cultivo.use-case';
import { AsociarEpaTipoCultivoWikiDto } from '../../../application/dto/epa-tipos-cultivos-wiki/asociar-epa-tipo-cultivo-wiki.dto';

@Controller('epa-tipos-cultivos-wiki')
export class EpaTiposCultivosWikiController {
  constructor(
    private readonly asociarEpaTipoCultivoWikiUseCase: AsociarEpaTipoCultivoWikiUseCase,
    private readonly desasociarEpaTipoCultivoWikiUseCase: DesasociarEpaTipoCultivoWikiUseCase,
    private readonly listarTiposCultivoPorEpaUseCase: ListarTiposCultivoPorEpaUseCase,
    private readonly listarEpasPorTipoCultivoUseCase: ListarEpasPorTipoCultivoUseCase,
  ) {}

  @Post()
  asociar(@Body() dto: AsociarEpaTipoCultivoWikiDto) {
    return this.asociarEpaTipoCultivoWikiUseCase.execute(dto);
  }

  @Delete(':epaId/:tipoCultivoWikiId')
  desasociar(
    @Param('epaId', ParseIntPipe) epaId: number,
    @Param('tipoCultivoWikiId', ParseIntPipe) tipoCultivoWikiId: number,
  ) {
    return this.desasociarEpaTipoCultivoWikiUseCase.execute(epaId, tipoCultivoWikiId);
  }

  @Get('epa/:epaId')
  listarPorEpa(@Param('epaId', ParseIntPipe) epaId: number) {
    return this.listarTiposCultivoPorEpaUseCase.execute(epaId);
  }

  @Get('tipo-cultivo/:tipoCultivoWikiId')
  listarPorTipoCultivo(@Param('tipoCultivoWikiId', ParseIntPipe) tipoCultivoWikiId: number) {
    return this.listarEpasPorTipoCultivoUseCase.execute(tipoCultivoWikiId);
  }
}