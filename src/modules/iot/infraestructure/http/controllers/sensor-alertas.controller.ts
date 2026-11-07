import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearSensorAlertaUseCase } from '../../../application/use-cases/sensor-alertas/crear-sensor-alerta.use-case';
import { ObtenerSensorAlertaUseCase } from '../../../application/use-cases/sensor-alertas/obtener-sensor-alerta.use-case';
import { ListarSensorAlertasUseCase } from '../../../application/use-cases/sensor-alertas/listar-sensor-alertas.use-case';
import { ListarAlertasPorSensorUseCase } from '../../../application/use-cases/sensor-alertas/listar-alertas-por-sensor.use-case';
import { EliminarSensorAlertaUseCase } from '../../../application/use-cases/sensor-alertas/eliminar-sensor-alerta.use-case';
import { CrearSensorAlertaDto } from '../../../application/dto/sensor-alertas/crear-sensor-alerta.dto';
import { Autenticado } from '../../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { PERMISO_VER_SENSORES, PERMISO_GESTIONAR_SENSORES } from '../permisos-iot';

@Controller('sensor-alertas')
export class SensorAlertasController {
  constructor(
    private readonly crearSensorAlertaUseCase: CrearSensorAlertaUseCase,
    private readonly obtenerSensorAlertaUseCase: ObtenerSensorAlertaUseCase,
    private readonly listarSensorAlertasUseCase: ListarSensorAlertasUseCase,
    private readonly listarAlertasPorSensorUseCase: ListarAlertasPorSensorUseCase,
    private readonly eliminarSensorAlertaUseCase: EliminarSensorAlertaUseCase,
  ) {}

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Post()
  crear(@Body() dto: CrearSensorAlertaDto) {
    return this.crearSensorAlertaUseCase.execute(dto);
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get()
  listar() {
    return this.listarSensorAlertasUseCase.execute();
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get('sensor/:sensorId')
  listarPorSensor(@Param('sensorId', ParseIntPipe) sensorId: number) {
    return this.listarAlertasPorSensorUseCase.execute(sensorId);
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerSensorAlertaUseCase.execute(id);
  }

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarSensorAlertaUseCase.execute(id);
  }
}