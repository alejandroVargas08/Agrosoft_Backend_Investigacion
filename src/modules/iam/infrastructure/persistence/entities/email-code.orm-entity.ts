import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { TipoCodigo } from '../../../domain/entities/email-code.entity';

@Entity('email_codes')
export class EmailCodeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  codigo: string;

  @Column({ type: 'enum', enum: TipoCodigo })
  tipo: TipoCodigo;

  @Column({ name: 'expira_en', type: 'timestamp' })
  expiraEn: Date;

  @Column({ default: false })
  usado: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}