import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { cambioRegistrado } from "../../domain/entities/actividad-historial.entity";

@Entity('actividadHistorial')
    export class actividadHistorialOrmEntity {
        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        actividadId: number;

        @Column()
        cultivoId: number; 

        @Column()
        usuarioId: number;

        @Column('text')
        motivo: string;

        @Column('json')
        cambios: cambioRegistrado;

        @CreateDateColumn()
        fecha: Date;
    }