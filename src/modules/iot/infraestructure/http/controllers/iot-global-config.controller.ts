import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CrearIotGlobalConfigUseCase } from '../../../application/use-cases/iot-global-config/crear-iot-global-config.use-case';
import { ObtenerIotGlobalConfigUseCase } from '../../../application/use-cases/iot-global-config/obtener-iot-global-config.use-case';
import { ListarIotGlobalConfigUseCase } from '../../../application/use-cases/iot-global-config/listar-iot-global-config.use-case';
import { ActualizarIotGlobalConfigUseCase } from '../../../application/use-cases/iot-global-config/actualizar-iot-global-config.use-case';
import { EliminarIotGlobalConfigUseCase } from '../../../application/use-cases/iot-global-config/eliminar-iot-global-config.use-case';
import { CrearIotGlobalConfigDto } from '../../../application/dto/iot-global-config/crear-iot-global-config.dto';
import { ActualizarIotGlobalConfigDto } from '../../../application/dto/iot-global-config/actualizar-iot-global-config.dto';

@Controller('iot-global-config')
export class IotGlobalConfigController {
  constructor(
    private readonly crearIotGlobalConfigUseCase: CrearIotGlobalConfigUseCase,
    private readonly obtenerIotGlobalConfigUseCase: ObtenerIotGlobalConfigUseCase,
    private readonly listarIotGlobalConfigUseCase: ListarIotGlobalConfigUseCase,
    private readonly actualizarIotGlobalConfigUseCase: ActualizarIotGlobalConfigUseCase,
    private readonly eliminarIotGlobalConfigUseCase: EliminarIotGlobalConfigUseCase,
  ) {}

  @Post()
  async crear(@Body() dto: CrearIotGlobalConfigDto) {
    const config = await this.crearIotGlobalConfigUseCase.execute(dto);
    return config.toPublicProps(); // ⭐ nunca toProps()
  }

  @Get()
  async listar() {
    const configs = await this.listarIotGlobalConfigUseCase.execute();
    return configs.map((c) => c.toPublicProps());
  }

  @Get(':id')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const config = await this.obtenerIotGlobalConfigUseCase.execute(id);
    return config.toPublicProps();
  }

  @Patch(':id')
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarIotGlobalConfigDto) {
    const config = await this.actualizarIotGlobalConfigUseCase.execute(id, dto);
    return config.toPublicProps();
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarIotGlobalConfigUseCase.execute(id);
  }
}