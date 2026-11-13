import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { AptitudCultivo } from '../../../domain/services/evaluador-aptitud.service';
import type { DisenoSiembra } from '../../../domain/services/disenador-siembra.service';
import type { PuntoGeo } from '../../../domain/value-objects/geo';
import type { PerfilTerreno } from '../../../domain/value-objects/perfil-terreno.vo';

@Entity('terreno_evaluaciones')
export class EvaluacionTerrenoOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @Index()
  @Column({ name: 'lote_id', type: 'int', nullable: true })
  loteId: number | null;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'jsonb' })
  poligono: PuntoGeo[];

  @Column({ name: 'cultivo_preferido', type: 'varchar', length: 40, nullable: true })
  cultivoPreferido: string | null;

  @Column({ name: 'usar_dron', default: true })
  usarDron: boolean;

  @Column({ name: 'usar_satelite', default: true })
  usarSatelite: boolean;

  @Column({ type: 'varchar', length: 20 })
  estado: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  etapa: string | null;

  @Column({ type: 'jsonb', nullable: true })
  perfil: PerfilTerreno | null;

  @Column({ type: 'jsonb', nullable: true })
  ranking: AptitudCultivo[] | null;

  @Column({ type: 'jsonb', nullable: true })
  disenos: DisenoSiembra[] | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  advertencias: string[];

  @Column({ name: 'mensaje_error', type: 'text', nullable: true })
  mensajeError: string | null;

  @Index()
  @Column({ name: 'solicitado_por_usuario_id' })
  solicitadoPorUsuarioId: number;

  @Column({ name: 'finalizado_en', type: 'timestamptz', nullable: true })
  finalizadoEn: Date | null;
}
