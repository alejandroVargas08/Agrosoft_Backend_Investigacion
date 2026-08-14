import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('sensor_lecturas')
export class SensorLecturaOrmEntity {
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

  @Column()
  valor: string;

  @Column({ name: 'fecha_lectura', type: 'timestamptz' })
  fechaLectura: Date;

  @Column()
  unidad: string;

  @Column({ type: 'varchar', nullable: true })
observaciones: string | null;
}