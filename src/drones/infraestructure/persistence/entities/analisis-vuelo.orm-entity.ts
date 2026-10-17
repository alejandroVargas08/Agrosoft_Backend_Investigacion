import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import type { ResumenAnalisis } from '../../../domain/entities/analisis-vuelo.entity';
import type { UmbralesNdviProps } from '../../../domain/value-objects/umbrales-ndvi.vo';

@Entity('drone_analisis')
export class AnalisisVueloOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @Index()
  @Column({ name: 'vuelo_id' })
  vueloId: number;

  @Column({ type: 'varchar', length: 20 })
  estado: string;

  @Column({ type: 'jsonb' })
  umbrales: UmbralesNdviProps;

  @Column({ name: 'capturas_totales', default: 0 })
  capturasTotales: number;

  @Column({ name: 'capturas_procesadas', default: 0 })
  capturasProcesadas: number;

  @Column({ type: 'jsonb', nullable: true })
  resumen: ResumenAnalisis | null;

  @Column({ name: 'mensaje_error', type: 'text', nullable: true })
  mensajeError: string | null;

  @Column({ name: 'iniciado_en', type: 'timestamptz', nullable: true })
  iniciadoEn: Date | null;

  @Column({ name: 'finalizado_en', type: 'timestamptz', nullable: true })
  finalizadoEn: Date | null;

  @Column({ name: 'solicitado_por_usuario_id' })
  solicitadoPorUsuarioId: number;
}
