import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'ventas' })
export class VentaEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ name: 'clienteId', type: 'integer', nullable: true })
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
  estado: string; // ej: 'completada', 'pendiente', 'anulada'

  @Column({ name: 'usuarioId', type: 'integer' })
  usuarioId: number;

  @Column({ name: 'anulada_por_usuario_id', type: 'integer', nullable: true })
  anuladaPorUsuarioId: number;

  @Column({ name: 'fecha_anulacion', type: 'timestamp', nullable: true })
  fechaAnulacion: Date;

  // Timestamps / Auditoría
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}