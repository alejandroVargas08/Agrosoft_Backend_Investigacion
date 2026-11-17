import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('novedades')
export class NovedadOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 40 })
    tipo: string;

    @Column({ type: 'varchar', length: 10 })
    urgencia: string;

    @Column({ type: 'varchar', length: 20, default: 'pendiente' })
    estado: string;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ name: 'reportada_por_usuario_id', type: 'int' })
    reportadaPorUsuarioId: number;

    @Column({ name: 'actividad_id', type: 'int', nullable: true })
    actividadId: number | null;

    @Column({ name: 'insumo_id', type: 'int', nullable: true })
    insumoId: number | null;

    @Column({ name: 'nombre_herramienta', type: 'varchar', length: 150, nullable: true })
    nombreHerramienta: string | null;

    @Column({ name: 'respuesta_instructor', type: 'text', nullable: true })
    respuestaInstructor: string | null;

    @Column({ name: 'respondida_por_usuario_id', type: 'int', nullable: true })
    respondidaPorUsuarioId: number | null;

    @Column({ name: 'respondida_en', type: 'timestamp', nullable: true })
    respondidaEn: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;
}
