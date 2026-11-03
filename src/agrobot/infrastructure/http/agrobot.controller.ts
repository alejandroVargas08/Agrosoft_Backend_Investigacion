import { Body, Controller, Inject, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Autenticado } from '../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';
import { UsuarioActual } from '../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { EnviarMensajeDto } from '../../../ia/application/http/dto/enviar-mensaje.dto';
import type { ConversacionIARepositoryPort } from '../../../ia/domain/ports/conversacion-ia.repository.port';
import { CONVERSACION_IA_REPOSITORY } from '../../../ia/domain/ports/conversacion-ia.repository.token';
import { ChatAgrobotUseCase } from '../../application/use-cases/chat-agrobot.use-case';

@Controller('agrobot')
@Autenticado()
export class AgrobotController {
  constructor(
    private readonly chat: ChatAgrobotUseCase,
    @Inject(CONVERSACION_IA_REPOSITORY) private readonly conversaciones: ConversacionIARepositoryPort,
  ) {}

  @Post('conversaciones/:id/chat')
  async responder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnviarMensajeDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    const conversacion = await this.conversaciones.buscarPorId(id);
    if (!conversacion || conversacion.obtenerUsuarioId() !== usuario.id) {
      throw new NotFoundException(`Conversación con id ${id} no encontrada`);
    }
    return this.chat.ejecutar(id, dto.mensaje, usuario);
  }
}
