import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearSensorLecturaUseCase } from '../../../application/use-cases/sensor-lecturas/crear-sensor-lectura.use-case';
import { ObtenerSensorLecturaUseCase } from '../../../application/use-cases/sensor-lecturas/obtener-sensor-lectura.use-case';
import { ListarSensorLecturasUseCase } from '../../../application/use-cases/sensor-lecturas/listar-sensor-lecturas.use-case';
import { ListarLecturasPorSensorUseCase } from '../../../application/use-cases/sensor-lecturas/listar-lecturas-por-sensor.use-case';
import { EliminarSensorLecturaUseCase } from '../../../application/use-cases/sensor-lecturas/eliminar-sensor-lectura.use-case';
import { CrearSensorLecturaDto } from '../../../application/dto/sensor-lecturas/crear-sensor-lectura.dto';
import { Autenticado } from '../../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { PERMISO_VER_SENSORES, PERMISO_GESTIONAR_SENSORES } from '../permisos-iot';

@Controller('sensor-lecturas')
export class SensorLecturasController {
  constructor(
    private readonly crearSensorLecturaUseCase: CrearSensorLecturaUseCase,
    private readonly obtenerSensorLecturaUseCase: ObtenerSensorLecturaUseCase,
    private readonly listarSensorLecturasUseCase: ListarSensorLecturasUseCase,
    private readonly listarLecturasPorSensorUseCase: ListarLecturasPorSensorUseCase,
    private readonly eliminarSensorLecturaUseCase: EliminarSensorLecturaUseCase,
  ) {}

  // Por aqui entran las lecturas del hardware, que no tiene sesion.
  // Queda sin guardia hasta que exista una credencial de dispositivo.
  @Post()
  crear(@Body() dto: CrearSensorLecturaDto) {
    return this.crearSensorLecturaUseCase.execute(dto);
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get()
  listar() {
    return this.listarSensorLecturasUseCase.execute();
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get('sensor/:sensorId')
  listarPorSensor(@Param('sensorId', ParseIntPipe) sensorId: number) {
    return this.listarLecturasPorSensorUseCase.execute(sensorId);
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerSensorLecturaUseCase.execute(id);
  }

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarSensorLecturaUseCase.execute(id);
  }
}