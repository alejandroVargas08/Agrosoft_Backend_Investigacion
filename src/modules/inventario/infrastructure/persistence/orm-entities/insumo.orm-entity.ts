import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    } from 'typeorm';

    @Entity('insumos')
    export class InsumoOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ type: 'varchar', nullable: true })
    descripcion?: string;

    @Column({ name: 'foto_url', type: 'varchar', nullable: true })
    fotoUrl?: string;

    @Column({ name: 'presentacion_tipo' })
    presentacionTipo: string;

    @Column({ name: 'presentacion_cantidad', type: 'numeric', precision: 12, scale: 2 })
    presentacionCantidad: string;

    @Column({ name: 'presentacion_unidad' })
    presentacionUnidad: string;

    @Column({ name: 'unidad_uso' })
    unidadUso: string;

    @Column({ name: 'tipo_materia', type: 'varchar', nullable: true })
    tipoMateria?: string;

    @Column({ name: 'factor_conversion_uso', type: 'numeric', precision: 12, scale: 4 })
    factorConversionUso: string;

    @Column({ name: 'stock_presentacion', type: 'numeric', precision: 12, scale: 2 })
    stockPresentacion: string;

    @Column({ name: 'stock_uso', type: 'numeric', precision: 12, scale: 2 })
    stockUso: string;

    @Column({ name: 'stock_reservado', type: 'numeric', precision: 12, scale: 2, default: 0 })
    stockReservado: string;

    @Column({ name: 'stock_minimo', type: 'numeric', precision: 12, scale: 2 })
    stockMinimo: string;

    @Column({ name: 'precio_unitario_presentacion', type: 'numeric', precision: 12, scale: 2 })
    precioUnitarioPresentacion: string;

    @Column({ name: 'precio_unitario_uso', type: 'numeric', precision: 12, scale: 4 })
    precioUnitarioUso: string;

    @Column({ name: 'almacen_id' })
    almacenId: number;

    @Column({ name: 'proveedor_id' })
    proveedorId: number;

    @Column({ name: 'categoria_id' })
    categoriaId: number;

    @Column({ name: 'tipo_insumo', type: 'varchar' })
    tipoInsumo: string;

    @Column({ type: 'varchar' })
    estado: string;

    @Column({ name: 'costo_adquisicion', type: 'numeric', precision: 12, scale: 2, nullable: true })
    costoAdquisicion?: string;

    @Column({ name: 'valor_residual', type: 'numeric', precision: 12, scale: 2, nullable: true })
    valorResidual?: string;

    @Column({ name: 'vida_util_horas', type: 'numeric', nullable: true })
    vidaUtilHoras?: string;

    @Column({ name: 'horas_usadas', type: 'numeric', nullable: true })
    horasUsadas?: string;

    @Column({ name: 'depreciacion_acumulada', type: 'numeric', precision: 12, scale: 2, nullable: true })
    depreciacionAcumulada?: string;

    @Column({ name: 'creado_por_usuario_id', nullable: true })
    creadoPorUsuarioId?: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;
}