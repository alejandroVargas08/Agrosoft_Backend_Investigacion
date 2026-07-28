import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Email } from '../../../domain/value-objects/email.vo';

@Entity('usuarios')

export class UsuarioOrmEntity{
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column({default: true})
    activo: boolean;
}
