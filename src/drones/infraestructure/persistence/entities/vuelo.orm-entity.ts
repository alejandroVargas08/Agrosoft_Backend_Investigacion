import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';

@Entity('drone_vuelos')
export class VueloOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminadoEn: Date | null;

  @Column({ name: 'dron_id' })
  dronId: number;

  @Column()
  nombre: string;

  @Column({ name: 'fecha_vuelo', type: 'timestamptz' })
  fechaVuelo: Date;

  @Column({ name: 'altura_vuelo_m', type: 'double precision', nullable: true })
  alturaVueloM: number | null;

  @Index()
  @Column({ name: 'lote_id' })
  loteId: number;

  @Column({ name: 'sub_lote_id', type: 'int', nullable: true })
  subLoteId: number | null;

  @Column({ name: 'cultivo_id', type: 'int', nullable: true })
  cultivoId: number | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'varchar', length: 20, default: 'REGISTRADO' })
  estado: string;

  @Column({ name: 'total_capturas', default: 0 })
  totalCapturas: number;

  @Column({ name: 'creado_por_usuario_id' })
  creadoPorUsuarioId: number;
}
