import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('usos_herramientas')
    export class usoHerramientaOrmEntity {
        @PrimaryGeneratedColumn()
        id: number;

        @Column({ name: 'actividadId'}) 
        actividadId: number;

        @Column({name: 'insumoId'})
        insumoId: number;

        @Column('double precision')
        horasUsadas: number;

        @Column('double precision')
        depreciacionGenerada: number;

        @Column('double precision')
        valorLibrosAntes: number;

        @Column('double precision')
        valorLibrosDespues: number;

        @Column()
        fechaUso: Date;

        @CreateDateColumn({ name: 'created_at'}) created_at: Date;
        @UpdateDateColumn({ name: 'updated_at'}) updated_at: Date;
        @DeleteDateColumn({ name: 'deleted_at'}) deleted_at: Date;

    }