import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { VentaDetalleEntity } from '../../../../comercial/ventas-detalles/domain/entities/ventas-detalle.entity';

@Entity({ name: 'productos_agro' })
export class ProductoAgroEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'unidadBase', type: 'varchar', length: 100 })
  unidadBase: string; 

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  imagen: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;


  @OneToMany(() => VentaDetalleEntity, (detalle) => detalle.productoAgro)
  detalles: VentaDetalleEntity[];
}