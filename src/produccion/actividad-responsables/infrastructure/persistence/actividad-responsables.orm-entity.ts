import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('actividades_responsables')
export class actividadResponsableOrmEntity {
    @PrimaryGeneratedColumn() 
    id: number;

    @Column({ name: 'actividadId' }) 
    actividadId: number;

    @Column({ name: 'usuarioId' }) 
    usuarioId: number;

    @Column('double precision') 
    horas: number;

    @Column('double precision') 
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