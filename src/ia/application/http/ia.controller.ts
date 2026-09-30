import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CrearConversacionUseCase } from '../use-case/crear-conversacion.use-case';
import { ListarConversacionesUseCase } from '../use-case/listar-conversaciones.use-case';
import { ObtenerMensajesUseCase } from '../use-case/obtener-mensajes.use-case';
import { EnviarMensajeConversacionUseCase } from '../use-case/enviar-mensaje-conversacion.use-case';
import { EnviarImagenesConversacionUseCase } from '../use-case/enviar-imagenes-conversacion.use-case';

import type { ConversacionIARepositoryPort } from '../../domain/ports/conversacion-ia.repository.port';
import { CONVERSACION_IA_REPOSITORY } from '../../domain/ports/conversacion-ia.repository.token';

import { CrearConversacionDto, EnviarMensajeDto } from './dto/enviar-mensaje.dto';
import { EnviarImagenesDto } from './dto/enviar-imagenes.dto';

@Controller('ia')
export class IaController {
  constructor(
    private readonly crearConversacionUseCase: CrearConversacionUseCase,
    private readonly listarConversacionesUseCase: ListarConversacionesUseCase,
    private readonly obtenerMensajesUseCase: ObtenerMensajesUseCase,
    private readonly enviarMensajeConversacionUseCase: EnviarMensajeConversacionUseCase,
    private readonly enviarImagenesConversacionUseCase: EnviarImagenesConversacionUseCase,
    @Inject(CONVERSACION_IA_REPOSITORY)
    private readonly conversaciones: ConversacionIARepositoryPort,
  ) {}

  @Post('conversaciones')
  async crear(@Body() dto: CrearConversacionDto) {
    const conversacion = await this.crearConversacionUseCase.ejecutar(dto.usuarioId, dto.titulo);
    return this.mapConversacion(conversacion);
  }

  @Get('conversaciones/usuario/:usuarioId')
  async listar(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    const conversaciones = await this.listarConversacionesUseCase.ejecutar(usuarioId);
    return conversaciones.map((c) => this.mapConversacion(c));
  }

  @Get('conversaciones/:id/mensajes')
  async mensajes(@Param('id', ParseIntPipe) id: number) {
    const mensajes = await this.obtenerMensajesUseCase.ejecutar(id);
    return mensajes.map((m) => ({
      id: m.obtenerId(),
      rol: m.obtenerRol(),
      contenido: m.obtenerContenido(),
      tieneImagenes: m.tieneImagenesAdjuntas(),
      cantidadImagenes: m.obtenerCantidadImagenes(),
      creadoEn: m.obtenerCreadoEn(),
    }));
  }

  @Post('conversaciones/:id/chat')
  async chat(@Param('id', ParseIntPipe) id: number, @Body() dto: EnviarMensajeDto) {
    return this.enviarMensajeConversacionUseCase.ejecutar({ conversacionId: id, mensaje: dto.mensaje });
  }

  @Post('conversaciones/:id/analizar-imagen')
  async analizarImagen(@Param('id', ParseIntPipe) id: number, @Body() dto: EnviarImagenesDto) {
    return this.enviarImagenesConversacionUseCase.ejecutar({
      conversacionId: id,
      imagenes: dto.imagenes,
      prompt: dto.prompt,
    });
  }

  @Delete('conversaciones/:id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.conversaciones.eliminar(id);
    return { eliminado: true };
  }

  private mapConversacion(c: any) {
    return {
      id: c.obtenerId(),
      titulo: c.obtenerTitulo(),
      creadoEn: c.obtenerCreadoEn(),
      actualizadoEn: c.obtenerActualizadoEn(),
    };
  }
}