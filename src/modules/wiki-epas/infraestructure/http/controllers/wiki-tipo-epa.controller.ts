import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearWikiTipoEpaUseCase } from '../../../application/use-cases/wiki-tipo-epa/crear-wiki-tipo-epa.use-case';
import { ObtenerWikiTipoEpaUseCase } from '../../../application/use-cases/wiki-tipo-epa/obtener-wiki-tipo-epa.use-case';
import { ListarWikiTipoEpaUseCase } from '../../../application/use-cases/wiki-tipo-epa/listar-wiki-tipo-epa.use-case';
import { ActualizarWikiTipoEpaUseCase } from '../../../application/use-cases/wiki-tipo-epa/actualizar-wiki-tipo-epa.use-case';
import { EliminarWikiTipoEpaUseCase } from '../../../application/use-cases/wiki-tipo-epa/eliminar-wiki-tipo-epa.use-case';
import { CrearWikiTipoEpaDto } from '../../../application/dto/wiki-tipo-epa/crear-wiki-tipo-epa.dto';
import { ActualizarWikiTipoEpaDto } from '../../../application/dto/wiki-tipo-epa/actualizar-wiki-tipo-epa.dto';

@Controller('wiki-tipo-epa')
export class WikiTipoEpaController {
  constructor(
    private readonly crearWikiTipoEpaUseCase: CrearWikiTipoEpaUseCase,
    private readonly obtenerWikiTipoEpaUseCase: ObtenerWikiTipoEpaUseCase,
    private readonly listarWikiTipoEpaUseCase: ListarWikiTipoEpaUseCase,
    private readonly actualizarWikiTipoEpaUseCase: ActualizarWikiTipoEpaUseCase,
    private readonly eliminarWikiTipoEpaUseCase: EliminarWikiTipoEpaUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearWikiTipoEpaDto) {
    return this.crearWikiTipoEpaUseCase.execute(dto);
  }

  @Get()
  listar() {
    return this.listarWikiTipoEpaUseCase.execute();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerWikiTipoEpaUseCase.execute(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarWikiTipoEpaDto) {
    return this.actualizarWikiTipoEpaUseCase.execute(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarWikiTipoEpaUseCase.execute(id);
  }
}