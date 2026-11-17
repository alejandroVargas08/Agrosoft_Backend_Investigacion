import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { ClaseTextura } from '../../../domain/value-objects/perfil-terreno.vo';

@Entity('terreno_cultivos_aptitud')
export class CultivoAptitudOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @Column({ type: 'varchar', length: 40, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 80 })
  nombre: string;

  @Column({ name: 'altitud_min_m', type: 'double precision' })
  altitudMinM: number;

  @Column({ name: 'altitud_max_m', type: 'double precision' })
  altitudMaxM: number;

  @Column({ name: 'temperatura_min_c', type: 'double precision' })
  temperaturaMinC: number;

  @Column({ name: 'temperatura_max_c', type: 'double precision' })
  temperaturaMaxC: number;

  @Column({ name: 'precipitacion_min_mm', type: 'double precision' })
  precipitacionMinMm: number;

  @Column({ name: 'precipitacion_max_mm', type: 'double precision' })
  precipitacionMaxMm: number;

  @Column({ name: 'ph_min', type: 'double precision' })
  phMin: number;

  @Column({ name: 'ph_max', type: 'double precision' })
  phMax: number;

  @Column({ name: 'pendiente_max_pct', type: 'double precision' })
  pendienteMaxPct: number;

  @Column({ name: 'texturas_preferidas', type: 'jsonb', default: () => "'[]'" })
  texturasPreferidas: ClaseTextura[];

  @Column({ name: 'distancia_surcos_m', type: 'double precision' })
  distanciaSurcosM: number;

  @Column({ name: 'distancia_plantas_m', type: 'double precision' })
  distanciaPlantasM: number;

  @Column({ name: 'ciclo_dias', type: 'int' })
  cicloDias: number;

  @Column({ default: false })
  perenne: boolean;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @Column({ default: true })
  activo: boolean;
}
