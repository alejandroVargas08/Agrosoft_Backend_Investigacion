import { Body, Controller, Post } from '@nestjs/common';
import { ChatAsistenteUseCase } from '../../application/use-case/chat-asistente.use-case';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('ia')
export class iaController {
  constructor(private readonly chatAsistenteUseCase: ChatAsistenteUseCase) {}

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto) {
    const respuesta = await this.chatAsistenteUseCase.execute(dto.mensaje, dto.contexto);
    return { respuesta };
  }
}