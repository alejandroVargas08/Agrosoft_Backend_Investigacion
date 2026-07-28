import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('actividadServicio')
export class actividadServicioOrmEntity {
    @PrimaryGeneratedColumn() 
    id: number;

    @Column({ name: 'actividadId' }) 
    actividadId: number;

    @Column({ name: 'nombreServicio' }) 
    nombreServicio: string;

    @Column({ name: 'proveedorId' }) 
    proveedorId: number;

    @Column({ name: 'maquinariaId' }) 
    maquinariaId: number;

    @Column('double precision') 
    horas: number;

    @Column('double precision', { name: 'precioHora' }) 
    precioHora: number;

    @Column('double precision') 
    costo: number;

    @CreateDateColumn({ name: 'created_at' }) 
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' }) 
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' }) 
    deletedAt: Date;
}