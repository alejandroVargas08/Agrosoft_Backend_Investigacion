import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('lotes_produccion')
    export class LoteProduccionOrmEntity{
        @PrimaryGeneratedColumn() id: number;
        @Column({ name: 'producto_agro_id' }) productoAgroId: number;
        @Column({ name: 'cultivo_id' }) cultivoId: number;
        @Column({ name: 'lote_id' }) loteId: number;
        @Column({ name: 'sub_lote_id', nullable: true }) subLoteId: number;
        @Column({ name: 'actividades_cosecha_id', nullable: true }) actividadesCosechaId: number;
        @Column() calidad: string;
        @Column('double precision', { name: 'cantidad_kg' }) cantidadKg: number;
        @Column('double precision', { name: 'stock_disponible_kg' }) stockDisponibleKg: number;
        @Column('double precision', { name: 'costo_unitario_kg' }) costoUnitarioKg: number;
        @Column('double precision', { name: 'costo_total' }) costoTotal: number;
        @Column('double precision', { name: 'precio_sugerido_kg' }) precioSugeridoKg: number;
}