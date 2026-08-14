import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearEpaUseCase } from '../../../application/use-cases/epas/crear-epa.use-case';
import { ObtenerEpaUseCase } from '../../../application/use-cases/epas/obtener-epa.use-case';
import { ListarEpasUseCase } from '../../../application/use-cases/epas/listar-epas.use-case';
import { ActualizarEpaUseCase } from '../../../application/use-cases/epas/actualizar-epa.use-case';
import { EliminarEpaUseCase } from '../../../application/use-cases/epas/eliminar-epa.use-case';
import { CrearEpaDto } from '../../../application/dto/epas/crear-epa.dto';
import { ActualizarEpaDto } from '../../../application/dto/epas/actualizar-epa.dto';

@Controller('epas')
export class EpasController {
  constructor(
    private readonly crearEpaUseCase: CrearEpaUseCase,
    private readonly obtenerEpaUseCase: ObtenerEpaUseCase,
    private readonly listarEpasUseCase: ListarEpasUseCase,
    private readonly actualizarEpaUseCase: ActualizarEpaUseCase,
    private readonly eliminarEpaUseCase: EliminarEpaUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearEpaDto) {
    return this.crearEpaUseCase.execute(dto);
  }

  @Get()
  listar() {
    return this.listarEpasUseCase.execute();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerEpaUseCase.execute(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarEpaDto) {
    return this.actualizarEpaUseCase.execute(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarEpaUseCase.execute(id);
  }
}