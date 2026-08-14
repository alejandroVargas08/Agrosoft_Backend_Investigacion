import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('epas')
export class EpaOrmEntity {
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

  @Column({ name: 'tipo_epa' })
  tipoEpa: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'text' })
  sintomas: string;

  @Column({ name: 'manejo_y_control', type: 'text' })
  manejoYControl: string;

  @Column({ name: 'meses_probables', type: 'int', array: true })
  mesesProbables: number[];

  @Column({ type: 'text', array: true })
  temporadas: string[];

  @Column({ name: 'notas_estacionalidad', type: 'text', nullable: true })
  notasEstacionalidad: string | null;

  @Column({ name: 'fotos_sintomas', type: 'text', array: true, default: '{}' })
  fotosSintomas: string[];

  @Column({ name: 'fotos_generales', type: 'text', array: true, default: '{}' })
  fotosGenerales: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  etiquetas: string[];

  @Column({ name: 'creado_por_usuario_id' })
  creadoPorUsuarioId: number;
}