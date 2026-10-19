import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('actividad_asignaciones')
@Index(['actividadId', 'aprendizId'], { unique: true, where: '"eliminado_en" IS NULL' })
export class ActividadAsignacionOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'actividad_id' })
    actividadId: number;

    @Column({ name: 'aprendiz_id' })
    aprendizId: number;

    @Column({ name: 'asignado_por_id' })
    asignadoPorId: number;

    @Column({ type: 'varchar', length: 20, default: 'ASIGNADA' })
    estado: string;

    @Column({ name: 'fecha_limite', type: 'date', nullable: true })
    fechaLimite: Date | null;

    @Column({ name: 'horas_trabajadas', type: 'float', nullable: true })
    horasTrabajadas: number | null;

    @Column({ name: 'comentario_aprendiz', type: 'text', nullable: true })
    comentarioAprendiz: string | null;

    @Column({ name: 'comentario_instructor', type: 'text', nullable: true })
    comentarioInstructor: string | null;

    @Column({ name: 'iniciada_en', type: 'timestamp', nullable: true })
    iniciadaEn: Date | null;

    @Column({ name: 'entregada_en', type: 'timestamp', nullable: true })
    entregadaEn: Date | null;

    @Column({ name: 'revisada_en', type: 'timestamp', nullable: true })
    revisadaEn: Date | null;

    @Column({ name: 'revisada_por_id', type: 'int', nullable: true })
    revisadaPorId: number | null;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'actualizado_en' })
    actualizadoEn: Date;

    @DeleteDateColumn({ name: 'eliminado_en' })
    eliminadoEn: Date | null;
}
