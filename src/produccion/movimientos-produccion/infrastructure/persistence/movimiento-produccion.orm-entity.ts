import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('movimientos_produccion')
    export class movimientoProduccionOrmEntity {
        @PrimaryGeneratedColumn() 
        id: number;
            
        @Column({ name: 'loteProduccionId' }) 
        loteProduccionId: number;
            
        @Column() 
        tipo: string;
            
        @Column('double precision', { name: 'cantidadKg' }) 
        cantidadKg: number;
            
        @Column('double precision', { name: 'costoUnitarioKg' }) 
        costoUnitarioKg: number;
            
        @Column('double precision', { name: 'precioUnitarioKg' }) 
        precioUnitarioKg: number;
            
        @Column('double precision', { name: 'costoTotal' }) 
        costoTotal: number;
            
        @Column({ name: 'ventaId', nullable: true }) 
        ventaId: number;
            
        @Column({ nullable: true, type: 'text' }) 
        descripcion: string;
            
        @Column({ name: 'usuarioId' }) 
        usuarioId: number;
            
        @Column() 
        fecha: Date;
            
        @CreateDateColumn({ name: 'created_at' }) 
        createdAt: Date;
            
        @UpdateDateColumn({ name: 'updated_at' }) 
        updatedAt: Date;
            
        @DeleteDateColumn({ name: 'deleted_at' }) 
        deletedAt: Date;
    }