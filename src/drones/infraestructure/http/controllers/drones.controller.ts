import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearDronUseCase } from '../../../application/use-cases/drones/crear-dron.use-case';
import { ObtenerDronUseCase } from '../../../application/use-cases/drones/obtener-dron.use-case';
import { ListarDronesUseCase } from '../../../application/use-cases/drones/listar-drones.use-case';
import { EliminarDronUseCase } from '../../../application/use-cases/drones/eliminar-dron.use-case';
import { CrearDronDto } from '../../../application/dto/drones/crear-dron.dto';

@Controller('drones')
export class DronesController {
  constructor(
    private readonly crearDronUseCase: CrearDronUseCase,
    private readonly obtenerDronUseCase: ObtenerDronUseCase,
    private readonly listarDronesUseCase: ListarDronesUseCase,
    private readonly eliminarDronUseCase: EliminarDronUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearDronDto) {
    return this.crearDronUseCase.execute(dto);
  }

  @Get()
  listar() {
    return this.listarDronesUseCase.execute();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerDronUseCase.execute(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarDronUseCase.execute(id);
  }
}
