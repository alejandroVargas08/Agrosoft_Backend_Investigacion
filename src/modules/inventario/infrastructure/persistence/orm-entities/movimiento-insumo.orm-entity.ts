import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('movimientos_insumos')
export class MovimientoInsumoOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'insumo_id' })
    insumoId: number;

    @Column({ type: 'varchar' })
    tipo: string;

    @Column({ name: 'cantidad_presentacion', type: 'numeric', precision: 12, scale: 2 })
    cantidadPresentacion: string;

    @Column({ name: 'cantidad_uso', type: 'numeric', precision: 12, scale: 2 })
    cantidadUso: string;

    @Column({ name: 'costo_unitario_presentacion', type: 'numeric', precision: 12, scale: 2 })
    costoUnitarioPresentacion: string;

    @Column({ name: 'costo_unitario_uso', type: 'numeric', precision: 12, scale: 4 })
    costoUnitarioUso: string;

    @Column({ name: 'costo_total', type: 'numeric', precision: 12, scale: 2 })
    costoTotal: string;

    @Column({ name: 'valor_inventario_resultante', type: 'numeric', precision: 12, scale: 2 })
    valorInventarioResultante: string;

    @Column({ type: 'varchar', nullable: true })
    descripcion?: string;

    @Column({ name: 'actividad_id', nullable: true })
    actividadId?: number;

    @Column({ name: 'usuario_id' })
    usuarioId: number;

    @Column({ name: 'almacen_origen_id', nullable: true })
    almacenOrigenId?: number;

    @Column({ name: 'almacen_destino_id', nullable: true })
    almacenDestinoId?: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    }