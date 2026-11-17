import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PushService } from '../../push/push.service';
import { QuitarDispositivoDto, RegistrarDispositivoDto } from '../../../application/dto/dispositivo-push.dto';
import { Autenticado } from '../../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { UsuarioActual } from '../../../../iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../../iam/domain/value-objects/alcance-datos.vo';

@Controller('push/dispositivos')
@Autenticado()
export class DispositivosPushController {
  constructor(private readonly push: PushService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrar(@Body() dto: RegistrarDispositivoDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    await this.push.registrar(usuario.id, dto.token, dto.plataforma);
  }

  @Post('baja')
  @HttpCode(HttpStatus.NO_CONTENT)
  async quitar(@Body() dto: QuitarDispositivoDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    await this.push.quitar(usuario.id, dto.token);
  }
}
