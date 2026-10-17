import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { EstadisticasIndice } from '../../../domain/value-objects/estadisticas-indice.vo';
import type { DistribucionClases } from '../../../domain/value-objects/umbrales-ndvi.vo';

@Entity('drone_resultados_captura')
export class ResultadoCapturaOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @Index()
  @Column({ name: 'analisis_id' })
  analisisId: number;

  @Column({ name: 'captura_id' })
  capturaId: number;

  @Column({ type: 'double precision', nullable: true })
  latitud: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitud: number | null;

  @Column({ name: 'ndvi_promedio', type: 'double precision' })
  ndviPromedio: number;

  @Column({ type: 'varchar', length: 20 })
  clasificacion: string;

  @Column({ name: 'es_critica', default: false })
  esCritica: boolean;

  @Column({ type: 'jsonb' })
  ndvi: EstadisticasIndice;

  @Column({ type: 'jsonb' })
  ndre: EstadisticasIndice;

  @Column({ type: 'jsonb' })
  gndvi: EstadisticasIndice;

  @Column({ name: 'histograma_ndvi', type: 'jsonb' })
  histogramaNdvi: number[];

  @Column({ name: 'distribucion_ndvi', type: 'jsonb' })
  distribucionNdvi: DistribucionClases;
}
