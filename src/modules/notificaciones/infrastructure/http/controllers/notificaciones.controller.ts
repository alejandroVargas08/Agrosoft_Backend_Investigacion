import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CrearNotificacionUseCase } from '../../../application/use-cases/crear-notificacion.use-case';
import { ListarNotificacionesPorUsuarioUseCase } from '../../../application/use-cases/listar-notificaciones-por-usuario.use-case';
import { MarcarNotificacionLeidaUseCase } from '../../../application/use-cases/marcar-notificacion-leida.use-case';
import { EliminarNotificacionUseCase } from '../../../application/use-cases/eliminar-notificacion.use-case';
import { CrearNotificacionDto } from '../../../application/dto/crear-notificacion.dto';
import { NOTIFICACION_REPOSITORY } from '../../../domain/ports/notificacion.repository.token';
import type { NotificacionRepositoryPort } from '../../../domain/ports/notificacion.repository.port';
import { Autenticado } from '../../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { UsuarioActual } from '../../../../iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../../iam/domain/value-objects/alcance-datos.vo';

const PERMISO_GESTIONAR_USUARIOS = 'usuarios.gestionar';

@Controller('notificaciones')
@Autenticado()
export class NotificacionesController {
  constructor(
    private readonly crearUseCase: CrearNotificacionUseCase,
    private readonly listarPorUsuarioUseCase: ListarNotificacionesPorUsuarioUseCase,
    private readonly marcarLeidaUseCase: MarcarNotificacionLeidaUseCase,
    private readonly eliminarUseCase: EliminarNotificacionUseCase,
    @Inject(NOTIFICACION_REPOSITORY)
    private readonly notificaciones: NotificacionRepositoryPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearNotificacionDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    if (dto.usuarioId !== usuario.id && !usuario.permisos.includes(PERMISO_GESTIONAR_USUARIOS)) {
      throw new ForbiddenException('Solo puedes crear notificaciones para ti');
    }
    return await this.crearUseCase.ejecutar(dto);
  }

  @Get(':usuarioId')
  @HttpCode(HttpStatus.OK)
  async listarPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    if (usuarioId !== usuario.id) {
      throw new ForbiddenException('Solo puedes ver tus propias notificaciones');
    }
    return await this.listarPorUsuarioUseCase.ejecutar(usuarioId);
  }

  @Patch(':id/leida')
  @HttpCode(HttpStatus.OK)
  async marcarLeida(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    await this.validarPropietario(id, usuario);
    return await this.marcarLeidaUseCase.ejecutar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    await this.validarPropietario(id, usuario);
    await this.eliminarUseCase.ejecutar(id);
  }

  private async validarPropietario(id: number, usuario: UsuarioAutenticado): Promise<void> {
    const notificacion = await this.notificaciones.buscarPorId(id);
    if (!notificacion || notificacion.obtenerUsuarioId() !== usuario.id) {
      throw new NotFoundException(`Notificación con id ${id} no encontrada`);
    }
  }
}
