import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CultivoOrmEntity } from "../../cultivos/infrastructure/persistence/cultivo.orm-entity";

@Entity('cultivo_historial')
    export class historialCultivoOrmEntity {
        @PrimaryGeneratedColumn()
        id: number;

        @Column({ name: 'cultivo_id'})
        cultivoId: number;

        @Column({name: 'usuario_id'})
        usuarioId: number;

        @Column({type: 'text'})
        motivo: string;

        @Column({ type: "jsonb"})
        cambios: Record<string, any>;

        @ManyToOne(() => CultivoOrmEntity, { onDelete: 'CASCADE'})
        @JoinColumn({ name: 'cultivo_id'})
        cultivo: CultivoOrmEntity;
    }