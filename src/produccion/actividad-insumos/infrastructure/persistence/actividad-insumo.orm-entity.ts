import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('actividad_insumos')
    export class actividadInsumoOrmEntity {
        @PrimaryGeneratedColumn() 
        id: number;

        @Column({ name: 'actividad_id' }) 
        actividadId: number;

        @Column({ name: 'insumo_id' }) 
        insumoId: number;

        @Column('double precision', { name: 'cantidad_usada' }) 
        cantidadUsada: number;

        @Column({ type: 'varchar' })
        unidad: string;

        @Column('double precision', { name: 'costo_unitario' }) 
        costoUnitario: number;

        @Column('double precision', { name: 'costo_total' }) 
        costoTotal: number;

        @CreateDateColumn({ name: 'created_at' })
        createdAt: Date;
        
        @UpdateDateColumn({ name: 'updated_at' })
        updatedAt: Date;
        
        @DeleteDateColumn({ name: 'deleted_at' })
        deletedAt: Date;
    }