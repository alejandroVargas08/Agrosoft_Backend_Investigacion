import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'pagos' })
export class PagoEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'ventaId', type: 'integer' })
  ventaId: number;

  @Column({ type: 'varchar', length: 100 })
  metodo: string; // ej: 'efectivo', 'transferencia', 'tarjeta'

  @Column({ type: 'double precision' })
  monto: number;

  @Column({ type: 'varchar', length: 10, default: 'COP' })
  moneda: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referencia: string;

  // Timestamps / Auditoría
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}