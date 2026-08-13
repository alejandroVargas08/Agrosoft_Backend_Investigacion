import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VentaEntity } from '../../../ventas/domain/entities/venta.entity';


@Entity({ name: 'facturas' })
export class FacturaEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'ventaId', type: 'integer' })
  ventaId: number;

  @Column({ type: 'varchar', length: 100 })
  numero: string;

  @Column({ type: 'varchar', length: 50 })
  prefijo: string;

  @Column({ name: 'fechaEmision', type: 'timestamp' })
  fechaEmision: Date;

  @Column({ type: 'timestamp' })
  vencimiento: Date;

  @Column({ name: 'qrUrl', type: 'varchar', length: 500, nullable: true })
  qrUrl: string;

  @Column({ name: 'pdfUrl', type: 'varchar', length: 500, nullable: true })
  pdfUrl: string;


  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  //Relacion 
  @ManyToOne(()=> VentaEntity, (venta)=> venta.facturas)
  @JoinColumn({name: 'venta_id'})
  venta: VentaEntity;
}