import { EmailCode, TipoCodigo } from '../../../domain/entities/email-code.entity';
import { EmailCodeOrmEntity } from '../entities/email-code.orm-entity';

export class EmailCodeMapper {
  static toDomain(orm: EmailCodeOrmEntity): EmailCode {
    return new EmailCode(
      orm.id,
      orm.email,
      orm.codigo,
      orm.tipo,
      orm.expiraEn,
      orm.usado,
    );
  }

  static toOrm(domain: EmailCode): Partial<EmailCodeOrmEntity> {
    return {
      id: domain.id ?? undefined,
      email: domain.email,
      codigo: domain.codigo,
      tipo: domain.tipo as TipoCodigo,
      expiraEn: domain.expiraEn,
      usado: domain.usado,
    };
  }
}