import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('sensores')
export class SensorOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminadoEn: Date | null;

  @Column({ name: 'nombre_sensor' })
  nombreSensor: string;

  @Column({ name: 'tipo_sensor_id' })
  tipoSensorId: number;

  @Column()
  protocolo: string;

  @Column({ name: 'endpoint_url', type: 'varchar', nullable: true })
endpointUrl: string | null;

  @Column({ name: 'mqtt_topic', type: 'varchar', nullable: true })
mqttTopic: string | null;

  @Column({ name: 'valor_minimo_sensor', type: 'double precision' })
  valorMinimoSensor: number;

  @Column({ name: 'valor_maximo_sensor', type: 'double precision' })
  valorMaximoSensor: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'estado_conexion', default: 'desconectado' })
  estadoConexion: string;

  @Column({ type: 'text', nullable: true })
  estado: string | null;

  @Column({ name: 'ultimo_valor', type: 'varchar', nullable: true })
ultimoValor: string | null;

  @Column({ name: 'ultima_medicion', type: 'timestamp', nullable: true })
  ultimaMedicion: Date | null;

  @Column({ name: 'ultima_vista_en', type: 'timestamp', nullable: true })
  ultimaVistaEn: Date | null;

  @Column({ name: 'cultivo_id', type: 'int', nullable: true })
cultivoId: number | null;

  @Column({ name: 'creado_por_usuario_id' })
  creadoPorUsuarioId: number;

  @Column({ name: 'global_config_id', type: 'int', nullable: true })
globalConfigId: number | null;

  @Column({ name: 'lote_id', type: 'int', nullable: true })
loteId: number | null;

  @Column({ name: 'sub_lote_id', type: 'int', nullable: true })
subLoteId: number | null;
}