import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VentaEntity } from '../../../../comercial/ventas/domain/entities/venta.entity';

@Entity({ name: 'historial_precios_lote' })
export class HistorialPreciosLoteEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'loteProduccionId', type: 'integer' })
  loteProduccionId: number;

  @Column({ name: 'precioAnterior', type: 'double precision' })
  precioAnterior: number;

  @Column({ name: 'precioNuevo', type: 'double precision' })
  precioNuevo: number;

  @Column({ name: 'usuarioId', type: 'integer' })
  usuarioId: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razon: string;

  @Column({ name: 'venta_id', type: 'integer', nullable: true })
  ventaId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  //Relaciones 
  @ManyToOne(() => VentaEntity, (venta) => venta.historialPreciosLote, { nullable: true })
  @JoinColumn({ name: 'venta_id' })
  venta: VentaEntity;
}