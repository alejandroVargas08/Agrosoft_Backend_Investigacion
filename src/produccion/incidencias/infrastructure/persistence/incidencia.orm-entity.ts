import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('incidencias')
export class IncidenciaOrmEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() titulo: string;
    @Column() tipo: string;
    @Column() severidad: string;
    @Column() estado: string;
    @Column({ name: 'cultivo_id', nullable: true }) cultivoId: number;
    @Column({ type: 'date' }) fecha: Date;
    @Column({ type: 'text', nullable: true }) descripcion: string;

    @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
    @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date;
}