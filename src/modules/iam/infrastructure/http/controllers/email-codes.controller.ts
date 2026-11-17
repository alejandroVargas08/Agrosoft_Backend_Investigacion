import { Body, Controller, Post } from '@nestjs/common';
import { EnviarCodigoDto } from '../../../application/dto/email-codes/enviar-codigo.dto';
import { VerificarCodigoDto } from '../../../application/dto/email-codes/verificar-codigo.dto';
import { RestablecerContrasenaDto } from '../../../application/dto/email-codes/restablecer-contrasena.dto';
import { GenerarCodigoUseCase } from '../../../application/use-cases/email-codes/generar-codigo.usecase';
import { VerificarCodigoUseCase } from '../../../application/use-cases/email-codes/verificar-codigo.usecase';
import { RestablecerContrasenaUseCase } from '../../../application/use-cases/email-codes/restablecer-contrasena.usecase';

@Controller('email-codes')
export class EmailCodesController {
  constructor(
    private readonly generarCodigoUseCase: GenerarCodigoUseCase,
    private readonly verificarCodigoUseCase: VerificarCodigoUseCase,
    private readonly restablecerContrasenaUseCase: RestablecerContrasenaUseCase,
  ) {}

  @Post('enviar')
  async enviar(@Body() dto: EnviarCodigoDto) {
    await this.generarCodigoUseCase.ejecutar(dto.email, dto.tipo);
    return { mensaje: 'Código enviado correctamente' };
  }

  @Post('verificar')
  async verificar(@Body() dto: VerificarCodigoDto) {
    await this.verificarCodigoUseCase.ejecutar(dto.email, dto.codigo, dto.tipo);
    return { mensaje: 'Código verificado correctamente' };
  }

  @Post('restablecer')
  async restablecer(@Body() dto: RestablecerContrasenaDto) {
    await this.restablecerContrasenaUseCase.ejecutar({
    correo: dto.email,
    token: dto.codigo,
    nuevaContrasena: dto.nuevaContrasena
    });
    return { mensaje: 'Contraseña restablecida correctamente' };
  }
}