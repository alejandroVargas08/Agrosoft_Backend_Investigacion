import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('telegram_form_estado')
export class EstadoFormularioOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'telegram_user_id' })
    telegramUserId: string;

    @Column()
    step: string;

    @Column({ type: 'jsonb' })
    data: Record<string, unknown>;

    @Column({ type: 'varchar' })
    estado: string;

    @Column({ name: 'access_token', type: 'varchar', nullable: true })
    accessToken?: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}