import { ConexionAgente } from '../value-objects/conexion-agente.vo';
import { CredencialesAgente } from '../value-objects/credenciales-agente.vo';

interface IotGlobalConfigProps {
  id: number | null;
  nombre: string;
  conexion: ConexionAgente;
  credenciales: CredencialesAgente;
  prefijoTema: string;
  temasPredeterminados: string | null;
  temasPersonalizados: string | null;
  loteId: number | null;
  subLoteId: number | null;
  activo: boolean;
  sensoresPredeterminadosInicializados: boolean;
  autoDiscover: boolean;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class IotGlobalConfig {
  private constructor(private props: IotGlobalConfigProps) {}

  static crear(input: Omit<IotGlobalConfigProps, 'id' | 'activo' | 'sensoresPredeterminadosInicializados' | 'eliminadoEn'>): IotGlobalConfig {
    return new IotGlobalConfig({
      ...input,
      id: null,
      activo: true,
      sensoresPredeterminadosInicializados: false,
      eliminadoEn: null,
    });
  }

  static desdePersistencia(props: IotGlobalConfigProps): IotGlobalConfig {
    return new IotGlobalConfig(props);
  }

  marcarSensoresPredeterminadosInicializados(): void {
    this.props.sensoresPredeterminadosInicializados = true;
  }

  desactivar(): void { this.props.activo = false; }
  activar(): void { this.props.activo = true; }
  marcarComoEliminado(): void { this.props.eliminadoEn = new Date(); }

  get id() { return this.props.id; }
  get nombre() { return this.props.nombre; }
  get conexion() { return this.props.conexion; }
  get credenciales() { return this.props.credenciales; }
  get prefijoTema() { return this.props.prefijoTema; }
  get temasPredeterminados() { return this.props.temasPredeterminados; }
  get temasPersonalizados() { return this.props.temasPersonalizados; }
  get loteId() { return this.props.loteId; }
  get subLoteId() { return this.props.subLoteId; }
  get activo() { return this.props.activo; }
  get sensoresPredeterminadosInicializados() { return this.props.sensoresPredeterminadosInicializados; }
  get autoDiscover() { return this.props.autoDiscover; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): IotGlobalConfigProps { return { ...this.props }; }

  // Versión segura para exponer por HTTP: sin la contraseña real
  toPublicProps() {
    return {
      id: this.props.id,
      nombre: this.props.nombre,
      agente: this.props.conexion.agente,
      puerto: this.props.conexion.puerto,
      protocolo: this.props.conexion.protocolo,
      nombreUsuario: this.props.credenciales.nombreUsuario,
      prefijoTema: this.props.prefijoTema,
      temasPredeterminados: this.props.temasPredeterminados,
      temasPersonalizados: this.props.temasPersonalizados,
      loteId: this.props.loteId,
      subLoteId: this.props.subLoteId,
      activo: this.props.activo,
      sensoresPredeterminadosInicializados: this.props.sensoresPredeterminadosInicializados,
      autoDiscover: this.props.autoDiscover,
      creadoEn: this.props.creadoEn,
      actualizadoEn: this.props.actualizadoEn,
    };
  }
}