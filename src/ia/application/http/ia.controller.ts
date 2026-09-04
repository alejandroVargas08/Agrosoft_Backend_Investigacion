import { Body, Controller, Post } from '@nestjs/common';
import { ChatAsistenteUseCase } from '../use-case/chat-asistente.use-case';
import { ChatRequestDto } from './dto/chat-request.dto';
import { AnalizarImagenDto } from './dto/analizar-imagen.dto';


@Controller('ia')
export class iaController {
  constructor(private readonly chatAsistenteUseCase: ChatAsistenteUseCase) {}

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto) {
    const respuesta = await this.chatAsistenteUseCase.execute(dto.mensaje, dto.contexto);
    return { respuesta };
  }

  @Post('analizar-imagen')
  async analizarImagen(@Body() dto: AnalizarImagenDto) {
    const respuesta = await this.chatAsistenteUseCase.analizarImagen(dto.imagen, dto.prompt);
    return { respuesta };
  }
}