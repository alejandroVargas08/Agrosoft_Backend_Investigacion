import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

@Entity('lotes')
export class LoteOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
})
geom: { type: 'Polygon'; coordinates: number[][][] };

    @Column({ name: 'areaM2', type: 'numeric', precision: 12, scale: 2 })
        areaM2: string;

    @Column({ name: 'areaHa', type: 'numeric', precision: 12, scale: 4 })
        areaHa: string;

    @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
})
centroide: { type: 'Point'; coordinates: [number, number] };

    @Column({ type: 'varchar', nullable: true })
        descripcion?: string;

    @Column({ type: 'varchar' })
        estado: string;

    @CreateDateColumn({ name: 'created_at' })
        createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
        updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
        deletedAt: Date | null;
}