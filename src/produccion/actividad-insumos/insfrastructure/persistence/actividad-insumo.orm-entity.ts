import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('actividadInsumo')
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
    }