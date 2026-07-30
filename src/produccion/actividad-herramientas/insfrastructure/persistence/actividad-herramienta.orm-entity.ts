import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('actividades_herramientas')
    export class actividadHerramientaOrmEntity {
        @PrimaryGeneratedColumn() id: number;
        @Column({ name: 'actividadId'}) actividadId: number;
        @Column({ name: 'insumoId'}) insumoId: number;
        @Column({ name: 'activoFijoId', nullable: true }) activoFijoId: number;
        @Column('double precision') horasEstimadas: number;

        @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
        @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
        @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date;
    }