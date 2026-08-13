import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('wiki_tipo_epa')
export class WikiTipoEpaOrmEntity {
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

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'tipo_epa_enum' })
  tipoEpaEnum: string;
}