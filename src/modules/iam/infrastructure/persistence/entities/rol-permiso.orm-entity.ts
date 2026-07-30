import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('rol_permisos')
export class RolPermisoOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rol_id' })
  rolId: number;

  @Column({ name: 'permiso_id' })
  permisoId: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminadoEn: Date | null;
}