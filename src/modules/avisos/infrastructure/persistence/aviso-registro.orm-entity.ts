import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/**
 * Lo que el vigilante ya avisó, para no repetirlo: "vencida:12", "stock:5",
 * y las marcas de hasta qué id ya revisó ("marca:incidencias" → "40").
 */
@Entity('avisos_registro')
export class AvisoRegistroOrmEntity {
    @PrimaryColumn({ type: 'varchar', length: 120 })
    clave: string;

    @Column({ type: 'varchar', length: 60, nullable: true })
    valor: string | null;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;
}
