import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('tipos_cultivos_wiki')
export class TipoCultivoWikiOrmEntity {
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
}