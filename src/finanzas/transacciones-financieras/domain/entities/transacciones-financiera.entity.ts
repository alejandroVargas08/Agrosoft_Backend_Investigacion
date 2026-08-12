import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { VentaEntity } from "../../../../comercial/ventas/domain/entities/venta.entity";

@Entity('transaccion_financiera')
export class TransaccionesFinancieraEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('varchar')
    tipo: string;

    @Column('varchar')
    categoria: string;

    @Column({ type: 'double precision' })
    monto: number;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column('date')
    fecha: Date;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
    deletedAt?: Date;

    @Column({ name: 'actividad_id', type: 'integer', nullable: true })
    actividadId: number;

    @Column({ name: 'venta_id', type: 'integer', nullable: true })
    ventaId: number;

    @Column({ name: 'usuario_id', type: 'integer', nullable: true })
    usuarioId: number;

    @Column({ name: 'insumo_id', type: 'integer', nullable: true })
    insumoId: number;

    //relalciones 
    @ManyToOne(() => VentaEntity, (venta) => venta.transacciones_financieras)
    @JoinColumn({ name: 'venta_id' })  
    venta: VentaEntity;
}
