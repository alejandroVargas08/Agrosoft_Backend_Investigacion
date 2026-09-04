import { RangoOperativo } from '../value-objects/rango-operativo.vo';
import { ConfiguracionConexion } from '../value-objects/configuracion-conexion.vo';

export type EstadoConexion = 'conectado' | 'desconectado' | 'error';

interface SensorProps {
  id: number | null;
  nombreSensor: string;
  tipoSensorId: number;
  conexion: ConfiguracionConexion;
  rango: RangoOperativo;
  activo: boolean;
  estadoConexion: EstadoConexion;
  estado: string | null;
  ultimoValor: string | null;
  ultimaMedicion: Date | null;
  ultimaVistaEn: Date | null;
  cultivoId: number | null;
  creadoPorUsuarioId: number;
  globalConfigId: number | null;
  loteId: number | null;
  subLoteId: number | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class Sensor {
  private constructor(private props: SensorProps) {}

  static crear(input: Omit<SensorProps, 'id' | 'activo' | 'estadoConexion' | 'ultimoValor' | 'ultimaMedicion' | 'ultimaVistaEn' | 'eliminadoEn'>): Sensor {
    return new Sensor({
      ...input,
      id: null,
      activo: true,
      estadoConexion: 'desconectado',
      ultimoValor: null,
      ultimaMedicion: null,
      ultimaVistaEn: null,
      eliminadoEn: null,
    });
  }

  static desdePersistencia(props: SensorProps): Sensor {
    return new Sensor(props);
  }

  registrarLectura(valor: string, medidoEn: Date): void {
    this.props.ultimoValor = valor;
    this.props.ultimaMedicion = medidoEn;
    this.props.ultimaVistaEn = new Date();
    this.props.estadoConexion = 'conectado';
  }

  desactivar(): void { this.props.activo = false; }
  activar(): void { this.props.activo = true; }
  marcarComoEliminado(): void { this.props.eliminadoEn = new Date(); }

  get id() { return this.props.id; }
  get nombreSensor() { return this.props.nombreSensor; }
  get tipoSensorId() { return this.props.tipoSensorId; }
  get conexion() { return this.props.conexion; }
  get rango() { return this.props.rango; }
  get activo() { return this.props.activo; }
  get estadoConexion() { return this.props.estadoConexion; }
  get estado() { return this.props.estado; }
  get ultimoValor() { return this.props.ultimoValor; }
  get ultimaMedicion() { return this.props.ultimaMedicion; }
  get ultimaVistaEn() { return this.props.ultimaVistaEn; }
  get cultivoId() { return this.props.cultivoId; }
  get creadoPorUsuarioId() { return this.props.creadoPorUsuarioId; }
  get globalConfigId() { return this.props.globalConfigId; }
  get loteId() { return this.props.loteId; }
  get subLoteId() { return this.props.subLoteId; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): SensorProps { return { ...this.props }; }
}