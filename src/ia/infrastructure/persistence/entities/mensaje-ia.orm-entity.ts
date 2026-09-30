import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mensajes_ia')
export class MensajeIAOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversacion_id' })
  conversacionId: number;

  @Column({ type: 'varchar', length: 20 })
  rol: 'user' | 'assistant';

  @Column({ type: 'text' })
  contenido: string;

  @Column({ name: 'tiene_imagenes', default: false })
  tieneImagenes: boolean;

  @Column({ name: 'cantidad_imagenes', default: 0 })
  cantidadImagenes: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}