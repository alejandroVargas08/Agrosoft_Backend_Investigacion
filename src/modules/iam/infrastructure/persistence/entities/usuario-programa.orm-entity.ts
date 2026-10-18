import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuario_programas_formacion')
@Index(['usuarioId', 'programaFormacionId'], { unique: true })
export class UsuarioProgramaOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'int', name: 'programa_formacion_id' })
  programaFormacionId: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
