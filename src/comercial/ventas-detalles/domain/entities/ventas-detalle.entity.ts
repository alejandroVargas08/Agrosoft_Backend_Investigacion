import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, ManyToOne, JoinColumn,} from 'typeorm';
import { VentaEntity } from '../../../ventas/domain/entities/venta.entity';
import { ProductoAgroEntity } from '../../../../produccion/productos-agro/domain/entities/productos-agro.entity';

@Entity('ventas_detalles')
export class VentaDetalleEntity {
@PrimaryGeneratedColumn()
id: number;

@Column({ type: 'integer'})
ventaId: number;

@Column({ type: 'integer' })
productoAgroId: number;

@Column({ type: 'integer', nullable: true })
loteProduccionId: number;

@Column({ type: 'integer', nullable: true })
cultivoId: number;

@Column({ type: 'double precision' })
cantidadKg: number;

@Column({ type: 'double precision' })
precioUnitarioKg: number;

@Column({ type: 'double precision' })
precioTotal: number;

@Column({ type: 'double precision', nullable: true })
costoUnitarioKg: number;

@Column({ type: 'double precision', nullable: true })
costoTotal: number;

@CreateDateColumn({ type: 'timestamp' })
created_at: Date;

@UpdateDateColumn({ type: 'timestamp' })
updated_at: Date;

@DeleteDateColumn({ type: 'timestamp', nullable: true })
deleted_at: Date;

//relacion 
@ManyToOne(()=> VentaEntity, (venta)=> venta.venta_detalles)
@JoinColumn({name: 'ventaId'})
venta: VentaEntity;

 @ManyToOne(() => ProductoAgroEntity, (producto) => producto.detalles)
  @JoinColumn({ name: 'producto_agro_id' })
  productoAgro: ProductoAgroEntity;

}