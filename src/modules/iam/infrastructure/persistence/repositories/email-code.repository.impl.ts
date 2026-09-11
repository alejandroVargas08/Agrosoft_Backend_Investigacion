import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailCodeRepository } from '../../../domain/ports/email-code.repository.port';
import { EmailCode, TipoCodigo } from '../../../domain/entities/email-code.entity';
import { EmailCodeOrmEntity } from '../entities/email-code.orm-entity';
import { EmailCodeMapper } from '../mappers/email-code.mapper';

@Injectable()
export class EmailCodeRepositoryImpl implements EmailCodeRepository {
  constructor(
    @InjectRepository(EmailCodeOrmEntity)
    private readonly repo: Repository<EmailCodeOrmEntity>,
  ) {}

  async crear(emailCode: EmailCode): Promise<void> {
    const orm = EmailCodeMapper.toOrm(emailCode);
    await this.repo.save(orm);
  }

  async buscarVigente(email: string, tipo: TipoCodigo): Promise<EmailCode | null> {
    const orm = await this.repo.findOne({
      where: { email, tipo, usado: false },
      order: { creadoEn: 'DESC' },
    });
    return orm ? EmailCodeMapper.toDomain(orm) : null;
  }

  async marcarUsado(id: number): Promise<void> {
    await this.repo.update(id, { usado: true });
  }
}