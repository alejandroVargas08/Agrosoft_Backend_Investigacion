import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("actividades")
    export class actividadesOrmEntity {
        @PrimaryGeneratedColumn()
        id: number;

        @Column({ type: "varchar", length: 150 })
        nombre: string;

        @Column({ type: "varchar", length: 50 })
        tipo: string;

        @Column({ type: "varchar", length: 50, nullable: true })
        subtipo: string | null;

        @Column({ name: "lote_id" })
        loteId: number;

        @Column({ name: "sub_lote_id", type: "int", nullable: true })
        subLoteId: number | null;

        @Column({ name: "cultivo_id" })
        cultivoId: number;

        @Column({ type: "date" })
        fecha: Date;

        @Column({ name: "horas_actividad", type: "float" })
        horasActividad: number;

        @Column({ name: "precio_hora_actividad", type: "float" })
        precioHoraActividad: number;

        @Column({ type: "text", nullable: true })
        descripcion: string;

        @Column({ name: "creado_por_usuario_id" })
        creadoPorUsuarioId: number;

        @Column({ name: "cantidad_plantas", nullable: true, type: "int" })
        cantidadPlantas: number | null;

        @Column({ name: "producto_agro_id", type: "int", nullable: true })
        productoAgroId: number | null;

        @Column({ type: "varchar", default: "Pendiente" })
        estado: string;

        @Column({ type: 'decimal', nullable: true })
        costoManoObra: number;

        @Column({ type: 'decimal', nullable: true })
        kgRecolectados: number;

        @CreateDateColumn({ name: 'created_at' })
        createdAt: Date;

        @UpdateDateColumn({ name: 'updated_at' })
        updatedAt: Date;

        @DeleteDateColumn({ name: 'deleted_at' })
        deletedAt: Date;
    }