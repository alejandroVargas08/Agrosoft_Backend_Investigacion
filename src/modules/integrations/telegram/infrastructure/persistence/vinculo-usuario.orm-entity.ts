import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('telegram_usuarios')
export class VinculoUsuarioOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // Un chat de Telegram solo puede estar vinculado a un usuario a la vez
    @Index({ unique: true })
    @Column({ name: 'telegram_user_id' })
    telegramUserId: string;

    @Column({ name: 'usuario_id' })
    usuarioId: number;

    @Column()
    nombre: string;

    @Column()
    correo: string;

    @CreateDateColumn({ name: 'vinculado_en' })
    vinculadoEn: Date;
}