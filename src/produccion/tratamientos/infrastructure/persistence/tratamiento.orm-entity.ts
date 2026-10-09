import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('tratamientos')
export class TratamientoOrmEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({ name: 'incidencia_id', nullable: true }) incidenciaId: number;
    @Column() producto: string;
    @Column({ nullable: true }) dosis: string;
    @Column({ type: 'date' }) fecha: Date;
    @Column('double precision', { default: 0 }) costo: number;
    @Column({ type: 'text', nullable: true }) notas: string;
    @Column() estado: string;

    @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
    @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date;
}