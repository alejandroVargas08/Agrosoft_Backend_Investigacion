import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reservas')
export class ReservaOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'insumo_id' })
    insumoId: number;

    @Column({ type: 'numeric', precision: 12, scale: 2 })
    cantidad: string;

    @Column({ name: 'fecha_reserva', type: 'timestamp' })
    fechaReserva: Date;

    @Column({ type: 'varchar', nullable: true })
    motivo?: string;

    @Column({ type: 'varchar' })
    estado: string;

    @Column({ name: 'usuario_id' })
    usuarioId: number;

    @Column({ name: 'actividad_id', nullable: true })
    actividadId?: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}