import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('actividades_insumos_uso')
    export class actividadInsumoUsoOrmEntity {
        @PrimaryGeneratedColumn() 
        id: number;

        @Column({ name: 'actividadId' }) 
        actividadId: number;

        @Column({ name: 'insumoId' }) 
        insumoId: number;

        @Column('double precision', { name: 'cantidadUso' }) 
        cantidadUso: number;

        @Column('double precision', { name: 'costoUnitarioUso' }) 
        costoUnitarioUso: number;

        @Column('double precision', { name: 'costoTotal' }) 
        costoTotal: number;

        @Column({ name: 'movimientoInsumoId', nullable: true }) 
        movimientoInsumoId: number;



        @CreateDateColumn({ name: 'created_at' }) 
        createdAt: Date;

        @UpdateDateColumn({ name: 'updated_at' }) 
        updatedAt: Date;

        @DeleteDateColumn({ name: 'deleted_at' }) 
        deletedAt: Date;
    }