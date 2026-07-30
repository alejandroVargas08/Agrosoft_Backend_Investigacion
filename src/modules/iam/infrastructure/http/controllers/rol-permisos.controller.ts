import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AsignarRolPermisoUseCase } from '../../../application/use-cases/rol-permisos/asignar-rol-permiso.use-case';
import { ListarPermisosPorRolUseCase } from '../../../application/use-cases/rol-permisos/listar-permisos-por-rol.use-case';
import { EliminarRolPermisoUseCase } from '../../../application/use-cases/rol-permisos/eliminar-rol-permiso.use-case';
import { AsignarRolPermisoDto } from '../../../application/dto/rol-permisos/asignar-rol-permiso.dto';

@Controller('rol-permisos')
export class RolPermisosController {
  constructor(
    private readonly asignarUseCase: AsignarRolPermisoUseCase,
    private readonly listarUseCase: ListarPermisosPorRolUseCase,
    private readonly eliminarUseCase: EliminarRolPermisoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async asignar(@Body() dto: AsignarRolPermisoDto) {
    return await this.asignarUseCase.ejecutar(dto);
  }

  @Get(':rolId')
  @HttpCode(HttpStatus.OK)
  async listarPorRol(@Param('rolId', ParseIntPipe) rolId: number) {
    return await this.listarUseCase.ejecutar(rolId);
  }

  @Delete(':rolId/:permisoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Param('permisoId', ParseIntPipe) permisoId: number,
  ) {
    await this.eliminarUseCase.ejecutar(rolId, permisoId);
  }
}