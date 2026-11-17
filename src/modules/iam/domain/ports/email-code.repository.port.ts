import { EmailCode, TipoCodigo } from '../entities/email-code.entity';


export interface EmailCodeRepository {
  crear(emailCode: EmailCode): Promise<void>;
  buscarVigente(email: string, tipo: TipoCodigo): Promise<EmailCode | null>;
  marcarUsado(id: number): Promise<void>;
}