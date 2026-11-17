import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('drones')
export class DronOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminadoEn: Date | null;

  @Column()
  nombre: string;

  @Column()
  modelo: string;

  @Column({ name: 'numero_serie', type: 'varchar', nullable: true })
  numeroSerie: string | null;

  @Column({ name: 'tipo_camara', type: 'varchar', length: 20 })
  tipoCamara: string;

  @Column({ name: 'tiene_rtk', default: false })
  tieneRtk: boolean;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'creado_por_usuario_id' })
  creadoPorUsuarioId: number;
}
