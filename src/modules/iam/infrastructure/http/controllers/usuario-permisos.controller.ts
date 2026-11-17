import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AsignarUsuarioPermisoUseCase } from '../../../application/use-cases/usuario-permisos/asignar-usuario-permiso.use-case';
import { ListarPermisosPorUsuarioUseCase } from '../../../application/use-cases/usuario-permisos/listar-permisos-por-usuario.use-case';
import { EliminarUsuarioPermisoUseCase } from '../../../application/use-cases/usuario-permisos/eliminar-usuario-permiso.use-case';
import { AsignarUsuarioPermisoDto } from '../../../application/dto/usuario-permisos/asignar-usuario-permiso.dto';
import { UsuarioPermiso } from '../../../domain/entities/usuario-permiso.entity';
import { Autenticado } from '../decorators/autenticado.decorator';
import { PERMISO_GESTIONAR_USUARIOS } from '../permisos-iam';

@Controller('usuario-permisos')
@Autenticado(PERMISO_GESTIONAR_USUARIOS)
export class UsuarioPermisoController {
  constructor(
    private readonly asignarUsuarioPermisoUseCase: AsignarUsuarioPermisoUseCase,
    private readonly listarPermisosPorUsuarioUseCase: ListarPermisosPorUsuarioUseCase,
    private readonly eliminarUsuarioPermisoUseCase: EliminarUsuarioPermisoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async asignar(@Body() dto: AsignarUsuarioPermisoDto): Promise<UsuarioPermiso> {
    return await this.asignarUsuarioPermisoUseCase.ejecutar(dto);
  }

  @Get(':usuarioId')
  @HttpCode(HttpStatus.OK)
  async listarPorUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ): Promise<UsuarioPermiso[]> {
    return await this.listarPermisosPorUsuarioUseCase.ejecutar(usuarioId);
  }

  @Delete(':usuarioId/:permisoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('permisoId', ParseIntPipe) permisoId: number,
  ): Promise<void> {
    await this.eliminarUsuarioPermisoUseCase.ejecutar(usuarioId, permisoId);
  }
}