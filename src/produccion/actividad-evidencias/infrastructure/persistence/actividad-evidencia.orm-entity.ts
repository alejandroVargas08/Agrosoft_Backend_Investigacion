import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('actividades_evidencias')
    export class actividadEvidenciaOrmEntity {
        @PrimaryGeneratedColumn() 
        id: number;
        
        @Column({ name: 'actividadId' }) 
        actividadId: number;
        
        @Column({ nullable: true, type: 'text' }) 
        descripcion: string;
        
        @Column('text', { array: true, default: '{}' }) 
        imagenes: string[];

        // Nullable a proposito: las evidencias que ya existian quedan sin
        // entrega, y las del instructor tampoco tienen.
        @Column({ name: 'asignacion_id', type: 'int', nullable: true })
        asignacionId: number | null;
        
        @CreateDateColumn({ name: 'created_at' }) 
        createdAt: Date;
        
        @UpdateDateColumn({ name: 'updated_at' }) 
        updatedAt: Date;
        
        @DeleteDateColumn({ name: 'deleted_at' }) 
        deletedAt: Date;

    }