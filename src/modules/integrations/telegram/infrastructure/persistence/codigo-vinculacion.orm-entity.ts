import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('telegram_codigos_vinculacion')
export class CodigoVinculacionOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column()
    codigo: string;

    @Column({ name: 'usuario_id' })
    usuarioId: number;

    @Column({ name: 'expira_en', type: 'timestamp' })
    expiraEn: Date;

    @Column({ name: 'usado_en', type: 'timestamp', nullable: true })
    usadoEn: Date | null;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;
}
