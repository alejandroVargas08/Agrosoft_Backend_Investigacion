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
        
        @CreateDateColumn({ name: 'created_at' }) 
        createdAt: Date;
        
        @UpdateDateColumn({ name: 'updated_at' }) 
        updatedAt: Date;
        
        @DeleteDateColumn({ name: 'deleted_at' }) 
        deletedAt: Date;

    }