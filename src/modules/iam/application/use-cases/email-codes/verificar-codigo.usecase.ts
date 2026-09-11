import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { TipoCodigo } from '../../../domain/entities/email-code.entity';
import type { EmailCodeRepository } from '../../../domain/ports/email-code.repository.port';

@Injectable()
export class VerificarCodigoUseCase {
  constructor(
    @Inject('EMAIL_CODE_REPOSITORY')
    private readonly emailCodeRepository: EmailCodeRepository,
  ) {}

  async ejecutar(email: string, codigo: string, tipo: TipoCodigo): Promise<boolean> {
    const emailCode = await this.emailCodeRepository.buscarVigente(email, tipo);

    if (!emailCode) {
      throw new BadRequestException('No hay un código vigente para este correo');
    }
    if (emailCode.codigo !== codigo) {
      throw new BadRequestException('El código ingresado es incorrecto');
    }
    if (!emailCode.esValidoPara(tipo)) {
      throw new BadRequestException('El código ha expirado o ya fue usado');
    }

    await this.emailCodeRepository.marcarUsado(emailCode.id!);
    return true;
  }
}