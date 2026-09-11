import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { TipoCodigo } from '../../domain/entities/email-code.entity';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async enviarCodigo(email: string, codigo: string, tipo: TipoCodigo): Promise<void> {
    const asunto =
      tipo === TipoCodigo.VERIFICACION_EMAIL
        ? 'Verifica tu correo - AgroSoft'
        : 'Restablece tu contraseña - AgroSoft';

    const titulo =
      tipo === TipoCodigo.VERIFICACION_EMAIL
        ? 'Verifica tu correo'
        : 'Restablece tu contraseña';

    const logoPath = path.join(__dirname, '..', 'assets', 'logo-agrosoft.png');

    await this.transporter.sendMail({
      from: `"AgroSoft" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: asunto,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #f4f7f2; padding: 32px 24px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="cid:logoAgrosoft" alt="AgroSoft" width="72" height="72" style="border-radius: 16px;" />
          </div>
          <h2 style="text-align: center; color: #1f2d1f; margin-bottom: 8px;">${titulo}</h2>
          <p style="text-align: center; color: #4a5a4a; font-size: 14px; margin-bottom: 24px;">
            Usa el siguiente código para continuar
          </p>
          <div style="background-color: #ffffff; border: 2px dashed #2f6b2f; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2f6b2f;">
              ${codigo}
            </span>
          </div>
          <p style="text-align: center; color: #6b7a6b; font-size: 13px;">
            Este código expira en 15 minutos. Si no solicitaste esto, puedes ignorar este correo.
          </p>
          <hr style="border: none; border-top: 1px solid #dde5dd; margin: 24px 0;" />
          <p style="text-align: center; color: #a0aca0; font-size: 12px;">
            © ${new Date().getFullYear()} AgroSoft. Todos los derechos reservados.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'logo-agrosoft.png',
          path: logoPath,
          cid: 'logoAgrosoft',
        },
      ],
    });
  }
}