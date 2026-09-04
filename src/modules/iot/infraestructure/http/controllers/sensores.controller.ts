import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearSensorUseCase } from '../../../application/use-cases/sensores/crear-sensor.use-case';
import { ObtenerSensorUseCase } from '../../../application/use-cases/sensores/obtener-sensor.use-case';
import { ListarSensoresUseCase } from '../../../application/use-cases/sensores/listar-sensores.use-case';
import { ActualizarSensorUseCase } from '../../../application/use-cases/sensores/actualizar-sensor.use-case';
import { EliminarSensorUseCase } from '../../../application/use-cases/sensores/eliminar-sensor.use-case';
import { CrearSensorDto } from '../../../application/dto/sensores/crear-sensor.dto';
import { ActualizarSensorDto } from '../../../application/dto/sensores/actualizar-sensor.dto';

@Controller('sensores')
export class SensoresController {
  constructor(
    private readonly crearSensorUseCase: CrearSensorUseCase,
    private readonly obtenerSensorUseCase: ObtenerSensorUseCase,
    private readonly listarSensoresUseCase: ListarSensoresUseCase,
    private readonly actualizarSensorUseCase: ActualizarSensorUseCase,
    private readonly eliminarSensorUseCase: EliminarSensorUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearSensorDto) {
    return this.crearSensorUseCase.execute(dto);
  }

  @Get()
  listar() {
    return this.listarSensoresUseCase.execute();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerSensorUseCase.execute(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarSensorDto) {
    return this.actualizarSensorUseCase.execute(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarSensorUseCase.execute(id);
  }
}