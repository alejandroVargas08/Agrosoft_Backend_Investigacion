import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import type { EstadoRol } from '../../../domain/entities/rol.entity';

@Entity('roles')
export class RolOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  nombre: string;

  @Column({ type: 'varchar', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', name: 'es_sistema', default: false })
  esSistema: boolean;

  @Column({ type: 'varchar', default: 'activo' })
  estado: EstadoRol;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminadoEn: Date | null;
}