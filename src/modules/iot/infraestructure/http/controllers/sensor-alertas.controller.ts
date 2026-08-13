import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearSensorAlertaUseCase } from '../../../application/use-cases/sensor-alertas/crear-sensor-alerta.use-case';
import { ObtenerSensorAlertaUseCase } from '../../../application/use-cases/sensor-alertas/obtener-sensor-alerta.use-case';
import { ListarSensorAlertasUseCase } from '../../../application/use-cases/sensor-alertas/listar-sensor-alertas.use-case';
import { ListarAlertasPorSensorUseCase } from '../../../application/use-cases/sensor-alertas/listar-alertas-por-sensor.use-case';
import { EliminarSensorAlertaUseCase } from '../../../application/use-cases/sensor-alertas/eliminar-sensor-alerta.use-case';
import { CrearSensorAlertaDto } from '../../../application/dto/sensor-alertas/crear-sensor-alerta.dto';

@Controller('sensor-alertas')
export class SensorAlertasController {
  constructor(
    private readonly crearSensorAlertaUseCase: CrearSensorAlertaUseCase,
    private readonly obtenerSensorAlertaUseCase: ObtenerSensorAlertaUseCase,
    private readonly listarSensorAlertasUseCase: ListarSensorAlertasUseCase,
    private readonly listarAlertasPorSensorUseCase: ListarAlertasPorSensorUseCase,
    private readonly eliminarSensorAlertaUseCase: EliminarSensorAlertaUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearSensorAlertaDto) {
    return this.crearSensorAlertaUseCase.execute(dto);
  }

  @Get()
  listar() {
    return this.listarSensorAlertasUseCase.execute();
  }

  @Get('sensor/:sensorId')
  listarPorSensor(@Param('sensorId', ParseIntPipe) sensorId: number) {
    return this.listarAlertasPorSensorUseCase.execute(sensorId);
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerSensorAlertaUseCase.execute(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarSensorAlertaUseCase.execute(id);
  }
}