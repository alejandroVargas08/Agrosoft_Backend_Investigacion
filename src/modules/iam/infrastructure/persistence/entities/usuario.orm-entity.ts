import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import type { EstadoUsuario } from '../../../domain/entities/usuario.entity';

@Entity('usuarios')
export class UsuarioOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ name: 'apellido', type: 'varchar', nullable: true }) 
  apellido: string;

  @Column({ type: 'varchar', unique: true })
  identificacion: string;

  @Column({ type: 'varchar', name: 'id_ficha', nullable: true })
  idFicha: string | null;

  @Column({ type: 'int', name: 'programa_formacion_id', nullable: true })
  programaFormacionId: number | null;

  @Column({ type: 'varchar' })
  telefono: string;

  @Column({ type: 'varchar', unique: true })
  correo: string;

  @Column({ type: 'varchar', name: 'contrasena_hash' })
  contrasenaHash: string;

  @Column({ type: 'timestamp', name: 'correo_verificado_en', nullable: true })
  correoVerificadoEn: Date | null;

  @Column({ type: 'varchar', default: 'activo' })
  estado: EstadoUsuario;

  @Column({ type: 'timestamp', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'int', name: 'rol_id' })
  rolId: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminadoEn: Date | null;
}