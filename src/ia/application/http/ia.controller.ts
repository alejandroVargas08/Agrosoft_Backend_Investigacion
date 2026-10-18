import { Body, Controller, Delete, ForbiddenException, Get, Inject, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CrearConversacionUseCase } from '../use-case/crear-conversacion.use-case';
import { ListarConversacionesUseCase } from '../use-case/listar-conversaciones.use-case';
import { ObtenerMensajesUseCase } from '../use-case/obtener-mensajes.use-case';
import { EnviarMensajeConversacionUseCase } from '../use-case/enviar-mensaje-conversacion.use-case';
import { EnviarImagenesConversacionUseCase } from '../use-case/enviar-imagenes-conversacion.use-case';
import type { ConversacionIARepositoryPort } from '../../domain/ports/conversacion-ia.repository.port';
import { CONVERSACION_IA_REPOSITORY } from '../../domain/ports/conversacion-ia.repository.token';
import { ConversacionIA } from '../../domain/entities/conversacion-ia.entity';
import { CrearConversacionDto, EnviarMensajeDto } from './dto/enviar-mensaje.dto';
import { EnviarImagenesDto } from './dto/enviar-imagenes.dto';
import { Autenticado } from '../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';
import { UsuarioActual } from '../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';

@Controller('ia')
@Autenticado()
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
  async crear(@Body() dto: CrearConversacionDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    const conversacion = await this.crearConversacionUseCase.ejecutar(usuario.id, dto.titulo);
    return this.mapConversacion(conversacion);
  }

  @Get('conversaciones/usuario/:usuarioId')
  async listar(@Param('usuarioId', ParseIntPipe) usuarioId: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    if (usuarioId !== usuario.id) {
      throw new ForbiddenException('Solo puedes ver tus propias conversaciones');
    }
    const conversaciones = await this.listarConversacionesUseCase.ejecutar(usuario.id);
    return conversaciones.map((c) => this.mapConversacion(c));
  }

  @Get('conversaciones/:id/mensajes')
  async mensajes(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    await this.validarPropietario(id, usuario);
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
  async chat(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnviarMensajeDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    await this.validarPropietario(id, usuario);
    return this.enviarMensajeConversacionUseCase.ejecutar({ conversacionId: id, mensaje: dto.mensaje });
  }

  @Post('conversaciones/:id/analizar-imagen')
  async analizarImagen(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnviarImagenesDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    await this.validarPropietario(id, usuario);
    return this.enviarImagenesConversacionUseCase.ejecutar({
      conversacionId: id,
      imagenes: dto.imagenes,
      prompt: dto.prompt,
    });
  }

  @Delete('conversaciones/:id')
  async eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    await this.validarPropietario(id, usuario);
    await this.conversaciones.eliminar(id);
    return { eliminado: true };
  }

  private async validarPropietario(conversacionId: number, usuario: UsuarioAutenticado): Promise<void> {
    const conversacion = await this.conversaciones.buscarPorId(conversacionId);
    if (!conversacion || conversacion.obtenerUsuarioId() !== usuario.id) {
      throw new NotFoundException(`Conversación con id ${conversacionId} no encontrada`);
    }
  }

  private mapConversacion(c: ConversacionIA) {
    return {
      id: c.obtenerId(),
      titulo: c.obtenerTitulo(),
      creadoEn: c.obtenerCreadoEn(),
      actualizadoEn: c.obtenerActualizadoEn(),
    };
  }
}
