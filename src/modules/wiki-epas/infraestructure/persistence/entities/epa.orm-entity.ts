import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { TipoCultivoWikiOrmEntity } from './tipo-cultivo-wiki.orm-entity';

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

  // Los cultivos a los que afecta. eager: viaja siempre con la EPA, asi un
  // guardado nunca la deja sin cultivos por no haberlos cargado.
  @ManyToMany(() => TipoCultivoWikiOrmEntity, { eager: true })
  @JoinTable({
    name: 'epa_cultivos_susceptibles',
    joinColumn: { name: 'epa_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tipo_cultivo_wiki_id', referencedColumnName: 'id' },
  })
  cultivosSusceptibles: TipoCultivoWikiOrmEntity[];
}