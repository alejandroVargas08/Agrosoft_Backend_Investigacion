import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import type { ArchivosCaptura } from '../../../domain/entities/captura.entity';

@Entity('drone_capturas')
@Index(['vueloId', 'claveCaptura'], { unique: true })
export class CapturaOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminadoEn: Date | null;

  @Column({ name: 'vuelo_id' })
  vueloId: number;

  @Column({ name: 'clave_captura', type: 'varchar', length: 30 })
  claveCaptura: string;

  @Column({ name: 'numero_captura' })
  numeroCaptura: number;

  @Column({ type: 'double precision', nullable: true })
  latitud: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitud: number | null;

  @Column({ name: 'altitud_relativa_m', type: 'double precision', nullable: true })
  altitudRelativaM: number | null;

  @Column({ name: 'inclinacion_camara_grados', type: 'double precision', nullable: true })
  inclinacionCamaraGrados: number | null;

  @Column({ name: 'tomada_en', type: 'timestamptz', nullable: true })
  tomadaEn: Date | null;

  @Column({ type: 'jsonb', default: {} })
  archivos: ArchivosCaptura;
}
