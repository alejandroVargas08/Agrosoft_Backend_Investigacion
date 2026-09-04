import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearTipoCultivoWikiUseCase } from '../../../application/use-cases/tipos-cultivos-wiki/crear-tipo-cultivo-wiki.use-case';
import { ObtenerTipoCultivoWikiUseCase } from '../../../application/use-cases/tipos-cultivos-wiki/obtener-tipo-cultivo-wiki.use-case';
import { ListarTiposCultivosWikiUseCase } from '../../../application/use-cases/tipos-cultivos-wiki/listar-tipos-cultivos-wiki.use-case';
import { ActualizarTipoCultivoWikiUseCase } from '../../../application/use-cases/tipos-cultivos-wiki/actualizar-tipo-cultivo-wiki.use-case';
import { EliminarTipoCultivoWikiUseCase } from '../../../application/use-cases/tipos-cultivos-wiki/eliminar-tipo-cultivo-wiki.use-case';
import { CrearTipoCultivoWikiDto } from '../../../application/dto/tipos-cultivos-wiki/crear-tipo-cultivo-wiki.dto';
import { ActualizarTipoCultivoWikiDto } from '../../../application/dto/tipos-cultivos-wiki/actualizar-tipo-cultivo-wiki.dto';

@Controller('tipos-cultivos-wiki')
export class TiposCultivosWikiController {
  constructor(
    private readonly crearTipoCultivoWikiUseCase: CrearTipoCultivoWikiUseCase,
    private readonly obtenerTipoCultivoWikiUseCase: ObtenerTipoCultivoWikiUseCase,
    private readonly listarTiposCultivosWikiUseCase: ListarTiposCultivosWikiUseCase,
    private readonly actualizarTipoCultivoWikiUseCase: ActualizarTipoCultivoWikiUseCase,
    private readonly eliminarTipoCultivoWikiUseCase: EliminarTipoCultivoWikiUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearTipoCultivoWikiDto) {
    return this.crearTipoCultivoWikiUseCase.execute(dto);
  }

  @Get()
  listar() {
    return this.listarTiposCultivosWikiUseCase.execute();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerTipoCultivoWikiUseCase.execute(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarTipoCultivoWikiDto) {
    return this.actualizarTipoCultivoWikiUseCase.execute(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarTipoCultivoWikiUseCase.execute(id);
  }
}