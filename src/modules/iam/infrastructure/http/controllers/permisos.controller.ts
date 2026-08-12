import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus} from '@nestjs/common';
import { CrearPermisoUseCase } from '../../../application/use-cases/permisos/crear-permiso.use-case';
import { ListarPermisosUseCase } from '../../../application/use-cases/permisos/listar-permisos.use-case';
import { ActualizarPermisoUseCase } from '../../../application/use-cases/permisos/actualizar-permiso.use-case';
import { EliminarPermisoUseCase } from '../../../application/use-cases/permisos/eliminar-permiso.use-case';
import { CrearPermisoDto } from '../../../application/dto/permisos/crear-permiso.dto';
import { ActualizarPermisoDto } from '../../../application/dto/permisos/actualizar-permiso.dto';
import { Permiso } from '../../../domain/entities/permiso.entity';

@Controller('permisos')
export class PermisoController {
  constructor(
    private readonly crearPermisoUseCase: CrearPermisoUseCase,
    private readonly listarPermisosUseCase: ListarPermisosUseCase,
    private readonly actualizarPermisoUseCase: ActualizarPermisoUseCase,
    private readonly eliminarPermisoUseCase: EliminarPermisoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearPermisoDto): Promise<Permiso> {
    return await this.crearPermisoUseCase.ejecutar(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listar(): Promise<Permiso[]> {
    return await this.listarPermisosUseCase.ejecutar();
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPermisoDto,
  ): Promise<Permiso> {
    return await this.actualizarPermisoUseCase.ejecutar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.eliminarPermisoUseCase.ejecutar(id);
  }
}