import { Inject, Injectable } from '@nestjs/common';
import { EmailCode, TipoCodigo } from '../../../domain/entities/email-code.entity';
import type { EmailCodeRepository } from '../../../domain/ports/email-code.repository.port';
import { EMAIL_CODE_REPOSITORY } from '../../../domain/ports/email-code.repository.token';
import { MailerService } from '../../../infrastructure/services/mailer.services';

@Injectable()
export class GenerarCodigoUseCase {
  constructor(
    @Inject(EMAIL_CODE_REPOSITORY)
    private readonly emailCodeRepository: EmailCodeRepository,
    private readonly mailerService: MailerService,
  ) {}

  async ejecutar(email: string, tipo: TipoCodigo): Promise<void> {
    const codigo = this.generarCodigoNumerico();
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000);

    const emailCode = new EmailCode(null, email, codigo, tipo, expiraEn, false);
    await this.emailCodeRepository.crear(emailCode);
    await this.mailerService.enviarCodigo(email, codigo, tipo);
  }

  private generarCodigoNumerico(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}