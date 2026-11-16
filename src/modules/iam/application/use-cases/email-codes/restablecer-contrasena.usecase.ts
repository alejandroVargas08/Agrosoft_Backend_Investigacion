import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import { TipoCodigo } from '../../../domain/entities/email-code.entity';
import type { EmailCodeRepository } from '../../../domain/ports/email-code.repository.port';
import { EMAIL_CODE_REPOSITORY } from '../../../domain/ports/email-code.repository.token';
import * as bcrypt from 'bcrypt';

interface RestablecerContrasenaRequest {
  correo: string;
  token: string;
  nuevaContrasena: string;
}

@Injectable()
export class RestablecerContrasenaUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
    @Inject(EMAIL_CODE_REPOSITORY)
    private readonly emailCodeRepository: EmailCodeRepository,
  ) {}

  async ejecutar(request: RestablecerContrasenaRequest): Promise<void> {
    const emailCode = await this.emailCodeRepository.buscarVigente(request.correo, TipoCodigo.RESTABLECER_CONTRASENA);
    if (
      !emailCode ||
      emailCode.codigo !== request.token ||
      !emailCode.esValidoPara(TipoCodigo.RESTABLECER_CONTRASENA)
    ) {
      throw new BadRequestException('El código no es válido o ya expiró. Solicita uno nuevo.');
    }

    const usuario = await this.usuarioRepository.buscarPorCorreo(request.correo);
    if (!usuario) {
      throw new NotFoundException('No se encontró un usuario con este correo');
    }

    const nuevoHash = await bcrypt.hash(request.nuevaContrasena, 10);
    usuario.cambiarContrasena(nuevoHash);
    await this.usuarioRepository.guardar(usuario);

    await this.emailCodeRepository.marcarUsado(emailCode.id!);
  }
}
