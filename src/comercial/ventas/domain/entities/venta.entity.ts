import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from '../../../clientes/domain/entities/cliente.entity';
import { FacturaEntity } from '../../../facturas/domain/entities/factura.entity';
import { PagoEntity } from '../../../pagos/domain/entities/pago.entity';
import { VentaDetalleEntity } from '../../../ventas-detalles/domain/entities/ventas-detalle.entity';
import { TransaccionesFinancieraEntity } from '../../../../finanzas/transacciones-financieras/domain/entities/transacciones-financiera.entity';
import { HistorialPreciosLoteEntity } from '../../../../produccion/historial_precios_lote/domain/entities/historial_precios_lote.entity';

@Entity({ name: 'ventas' })
export class VentaEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ name: 'cliente_id', type: 'integer', nullable: true })
  clienteId: number;

  @Column({ type: 'double precision' })
  subtotal: number;

  @Column({ type: 'double precision' })
  impuestos: number;

  @Column({ type: 'double precision' })
  descuento: number;

  @Column({ type: 'double precision' })
  total: number;

  @Column({ type: 'varchar', length: 50 })
  estado: string;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @Column({ name: 'anulada_por_usuario_id', type: 'integer', nullable: true })
  anuladaPorUsuarioId: number;

  @Column({ name: 'fecha_anulacion', type: 'timestamp', nullable: true })
  fechaAnulacion: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  //Relacion
  @ManyToOne(() => Cliente, (cliente) => cliente.ventas, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @OneToMany(() => FacturaEntity, (factura) => factura.venta)
  facturas: FacturaEntity[];

  @OneToMany(() => PagoEntity, (pago) => pago.venta)
  pagos: PagoEntity[];

  @OneToMany(()=> VentaDetalleEntity, (venta_detalles) => venta_detalles.venta)
  venta_detalles: VentaDetalleEntity[];

  @OneToMany(() => TransaccionesFinancieraEntity, (trans) => trans.venta)
  transacciones_financieras: TransaccionesFinancieraEntity[];
  
  @OneToMany(() => HistorialPreciosLoteEntity, (hist) => hist.venta)
  historialPreciosLote: HistorialPreciosLoteEntity[];
}