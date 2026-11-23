import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('sensor_alertas')
export class SensorAlertaOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminadoEn: Date | null;

  @Column({ name: 'sensor_id' })
  sensorId: number;

  @Column({ type: 'double precision' })
  valor: number;

  @Column({ type: 'double precision' })
  umbral: number;

  @Column({ type: 'varchar', length: 10 })
  tipo: string;

  @Column({ name: 'fecha_alerta', type: 'timestamp' })
  fechaAlerta: Date;

  @Column({ name: 'lote_id', type: 'int', nullable: true })
  loteId: number | null;

  @Column({ name: 'sub_lote_id', type: 'int', nullable: true })
  subLoteId: number | null;

  // Cuando se cierra: la lectura volvio al rango ('normalizada') o alguien la
  // descarto a mano ('descartada'). Mientras sea null, la alerta esta activa.
  @Column({ name: 'resuelta_en', type: 'timestamp', nullable: true })
  resueltaEn: Date | null;

  @Column({ type: 'varchar', length: 12, nullable: true })
  resolucion: string | null;

  @Column({ name: 'valor_normalizado', type: 'double precision', nullable: true })
  valorNormalizado: number | null;
}