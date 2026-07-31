import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CrearNotificacionUseCase } from '../../../application/use-cases/crear-notificacion.use-case';
import { ListarNotificacionesPorUsuarioUseCase } from '../../../application/use-cases/listar-notificaciones-por-usuario.use-case';
import { MarcarNotificacionLeidaUseCase } from '../../../application/use-cases/marcar-notificacion-leida.use-case';
import { EliminarNotificacionUseCase } from '../../../application/use-cases/eliminar-notificacion.use-case';
import { CrearNotificacionDto } from '../../../application/dto/crear-notificacion.dto';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(
    private readonly crearUseCase: CrearNotificacionUseCase,
    private readonly listarPorUsuarioUseCase: ListarNotificacionesPorUsuarioUseCase,
    private readonly marcarLeidaUseCase: MarcarNotificacionLeidaUseCase,
    private readonly eliminarUseCase: EliminarNotificacionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearNotificacionDto) {
    return await this.crearUseCase.ejecutar(dto);
  }

  @Get(':usuarioId')
  @HttpCode(HttpStatus.OK)
  async listarPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return await this.listarPorUsuarioUseCase.ejecutar(usuarioId);
  }

  @Patch(':id/leida')
  @HttpCode(HttpStatus.OK)
  async marcarLeida(@Param('id', ParseIntPipe) id: number) {
    return await this.marcarLeidaUseCase.ejecutar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.eliminarUseCase.ejecutar(id);
  }
}