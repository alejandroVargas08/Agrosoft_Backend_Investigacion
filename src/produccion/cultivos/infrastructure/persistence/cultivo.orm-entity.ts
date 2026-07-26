import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('cultivos')
    export class CultivoOrmEntity {
        @PrimaryGeneratedColumn() id: number;
        @Column() nombreCultivo: string;
        @Column() tipoCultivo: string;
        @Column({ name: 'lote_id'}) loteId: number; 
        @Column({ name: 'sub_Lote_id', nullable: true}) subLoteId: number;
        @Column() fechaSiembra: Date;
        @Column({ nullable: true}) fechaFinalizacion: Date;
        @Column('double precision', { default: 0}) costoTotal: number;
        @Column() estado: string;

        @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
        @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
        @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date;
    }