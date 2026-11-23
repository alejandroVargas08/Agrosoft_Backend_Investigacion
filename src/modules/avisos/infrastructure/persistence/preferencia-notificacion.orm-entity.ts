import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('preferencias_notificacion')
export class PreferenciaNotificacionOrmEntity {
    @PrimaryColumn({ name: 'usuario_id', type: 'int' })
    usuarioId: number;

    @Column({ name: 'alertas_sensores', type: 'boolean', default: true })
    alertasSensores: boolean;

    @Column({ name: 'stock_bajo', type: 'boolean', default: true })
    stockBajo: boolean;

    @Column({ name: 'actividades_vencidas', type: 'boolean', default: true })
    actividadesVencidas: boolean;

    @Column({ name: 'nuevas_incidencias', type: 'boolean', default: true })
    nuevasIncidencias: boolean;

    @UpdateDateColumn({ name: 'actualizado_en' })
    actualizadoEn: Date;
}
