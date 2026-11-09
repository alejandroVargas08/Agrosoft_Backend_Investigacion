import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('programa_codigos_invitacion')
export class CodigoInvitacionOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 20 })
    codigo: string;

    @Column({ name: 'programa_formacion_id' })
    programaFormacionId: number;

    @Column({ name: 'expira_en', type: 'timestamp' })
    expiraEn: Date;

    @Column({ name: 'creado_por_id' })
    creadoPorId: number;

    @Column({ name: 'anulado_en', type: 'timestamp', nullable: true })
    anuladoEn: Date | null;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;
}
