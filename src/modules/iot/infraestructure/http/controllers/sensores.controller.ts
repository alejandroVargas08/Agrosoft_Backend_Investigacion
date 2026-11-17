import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearSensorUseCase } from '../../../application/use-cases/sensores/crear-sensor.use-case';
import { ObtenerSensorPublicoUseCase } from '../../../application/use-cases/sensores/obtener-sensor-publico.use-case';
import { ListarSensoresUseCase } from '../../../application/use-cases/sensores/listar-sensores.use-case';
import { ActualizarSensorUseCase } from '../../../application/use-cases/sensores/actualizar-sensor.use-case';
import { EliminarSensorUseCase } from '../../../application/use-cases/sensores/eliminar-sensor.use-case';
import { CrearSensorDto } from '../../../application/dto/sensores/crear-sensor.dto';
import { ActualizarSensorDto } from '../../../application/dto/sensores/actualizar-sensor.dto';
import { Autenticado } from '../../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { PERMISO_VER_SENSORES, PERMISO_GESTIONAR_SENSORES } from '../permisos-iot';

@Controller('sensores')
export class SensoresController {
  constructor(
    private readonly crearSensorUseCase: CrearSensorUseCase,
    private readonly obtenerSensorPublicoUseCase: ObtenerSensorPublicoUseCase,
    private readonly listarSensoresUseCase: ListarSensoresUseCase,
    private readonly actualizarSensorUseCase: ActualizarSensorUseCase,
    private readonly eliminarSensorUseCase: EliminarSensorUseCase,
  ) {}

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Post()
  crear(@Body() dto: CrearSensorDto) {
    return this.crearSensorUseCase.execute(dto);
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get()
  listar() {
    return this.listarSensoresUseCase.execute();
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerSensorPublicoUseCase.execute(id);
  }

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarSensorDto) {
    return this.actualizarSensorUseCase.execute(id, dto);
  }

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarSensorUseCase.execute(id);
  }
}