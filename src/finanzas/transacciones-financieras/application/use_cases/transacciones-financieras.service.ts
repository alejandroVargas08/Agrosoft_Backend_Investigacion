import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'transacciones_financieras' })
export class TransaccionesFinancierasService {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  tipo: string; // ej: 'Ingreso', 'Egreso'

  @Column({ type: 'varchar', length: 255 })
  categoria: string;

  @Column({ type: 'double precision' })
  monto: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  
  @Column({ name: 'actividadId', type: 'integer', nullable: true })
  actividadId: number;

  @Column({ name: 'insumoId', type: 'integer', nullable: true })
  insumoId: number;

  @Column({ name: 'ventaId', type: 'integer', nullable: true })
  ventaId: number;

  @Column({ name: 'usuarioId', type: 'integer', nullable: true })
  usuarioId: number;

  
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}