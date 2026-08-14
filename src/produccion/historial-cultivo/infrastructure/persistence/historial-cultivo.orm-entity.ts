import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('cultivo_historial')
export class historialCultivoOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'cultivo_id' })
    cultivoId: number;

    @Column({ name: 'usuario_id' })
    usuarioId: number;

    @Column({ type: 'text' })
    motivo: string;

    @Column({ type: 'jsonb' })
    cambios: Record<string, any>;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}