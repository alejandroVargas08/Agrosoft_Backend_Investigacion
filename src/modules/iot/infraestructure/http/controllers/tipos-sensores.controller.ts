import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearTipoSensorUseCase } from '../../../application/use-cases/tipos-sensores/crear-tipo-sensor.use-case';
import { ObtenerTipoSensorUseCase } from '../../../application/use-cases/tipos-sensores/obtener-tipo-sensor.use-case';
import { ListarTiposSensoresUseCase } from '../../../application/use-cases/tipos-sensores/listar-tipos-sensores.use-case';
import { ActualizarTipoSensorUseCase } from '../../../application/use-cases/tipos-sensores/actualizar-tipo-sensor.use-case';
import { EliminarTipoSensorUseCase } from '../../../application/use-cases/tipos-sensores/eliminar-tipo-sensor.use-case';
import { CrearTipoSensorDto } from '../../../application/dto/tipos-sensores/crear-tipo-sensor.dto';
import { ActualizarTipoSensorDto } from '../../../application/dto/tipos-sensores/actualizar-tipo-sensor.dto';
import { Autenticado } from '../../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { PERMISO_VER_SENSORES, PERMISO_GESTIONAR_SENSORES } from '../permisos-iot';

@Controller('tipos-sensores')
export class TiposSensoresController {
  constructor(
    private readonly crearTipoSensorUseCase: CrearTipoSensorUseCase,
    private readonly obtenerTipoSensorUseCase: ObtenerTipoSensorUseCase,
    private readonly listarTiposSensoresUseCase: ListarTiposSensoresUseCase,
    private readonly actualizarTipoSensorUseCase: ActualizarTipoSensorUseCase,
    private readonly eliminarTipoSensorUseCase: EliminarTipoSensorUseCase,
  ) {}

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Post()
  crear(@Body() dto: CrearTipoSensorDto) {
    return this.crearTipoSensorUseCase.execute(dto);
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get()
  listar() {
    return this.listarTiposSensoresUseCase.execute();
  }

  @Autenticado(PERMISO_VER_SENSORES)
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerTipoSensorUseCase.execute(id);
  }

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarTipoSensorDto) {
    return this.actualizarTipoSensorUseCase.execute(id, dto);
  }

  @Autenticado(PERMISO_GESTIONAR_SENSORES)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarTipoSensorUseCase.execute(id);
  }
}