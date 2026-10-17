import { Banda, BandaMultiespectral, BANDAS_MULTIESPECTRALES } from '../value-objects/archivo-dji.vo';
import { Coordenada } from '../value-objects/coordenada.vo';

export interface CalibracionBanda {
  blackLevel: number | null;
  ganancia: number | null;
  exposicionSeg: number | null;
  ajusteGanancia: number | null;
  irradiancia: number | null;
  vineteo: number[] | null;
  centroOpticoX: number | null;
  centroOpticoY: number | null;
}

export interface ArchivoBanda {
  ruta: string;
  nombreOriginal: string;
  calibracion: CalibracionBanda;
}

export interface MetadatosCaptura {
  ubicacion: Coordenada | null;
  altitudRelativaM: number | null;
  inclinacionCamaraGrados: number | null;
  tomadaEn: Date | null;
}

export type ArchivosCaptura = Partial<Record<Banda, ArchivoBanda>>;

interface CapturaProps {
  id: number | null;
  vueloId: number;
  claveCaptura: string;
  numeroCaptura: number;
  ubicacion: Coordenada | null;
  altitudRelativaM: number | null;
  inclinacionCamaraGrados: number | null;
  tomadaEn: Date | null;
  archivos: ArchivosCaptura;
  creadoEn?: Date;
  actualizadoEn?: Date;
  eliminadoEn?: Date | null;
}

export class Captura {
  private constructor(private props: CapturaProps) {}

  static crear(input: Pick<CapturaProps, 'vueloId' | 'claveCaptura' | 'numeroCaptura'>): Captura {
    return new Captura({
      ...input,
      id: null,
      ubicacion: null,
      altitudRelativaM: null,
      inclinacionCamaraGrados: null,
      tomadaEn: null,
      archivos: {},
      eliminadoEn: null,
    });
  }

  static desdePersistencia(props: CapturaProps): Captura {
    return new Captura(props);
  }

  agregarArchivo(banda: Banda, archivo: ArchivoBanda, metadatos: MetadatosCaptura): void {
    this.props.archivos = { ...this.props.archivos, [banda]: archivo };
    this.props.ubicacion ??= metadatos.ubicacion;
    this.props.altitudRelativaM ??= metadatos.altitudRelativaM;
    this.props.inclinacionCamaraGrados ??= metadatos.inclinacionCamaraGrados;
    this.props.tomadaEn ??= metadatos.tomadaEn;
  }

  bandasFaltantes(): BandaMultiespectral[] {
    return BANDAS_MULTIESPECTRALES.filter((banda) => !this.props.archivos[banda]);
  }

  get completa(): boolean { return this.bandasFaltantes().length === 0; }

  get id() { return this.props.id; }
  get vueloId() { return this.props.vueloId; }
  get claveCaptura() { return this.props.claveCaptura; }
  get numeroCaptura() { return this.props.numeroCaptura; }
  get ubicacion() { return this.props.ubicacion; }
  get altitudRelativaM() { return this.props.altitudRelativaM; }
  get inclinacionCamaraGrados() { return this.props.inclinacionCamaraGrados; }
  get tomadaEn() { return this.props.tomadaEn; }
  get archivos() { return this.props.archivos; }
  get creadoEn() { return this.props.creadoEn; }
  get actualizadoEn() { return this.props.actualizadoEn; }
  get eliminadoEn() { return this.props.eliminadoEn; }

  toProps(): CapturaProps { return { ...this.props }; }

  toJSON() {
    return {
      ...this.props,
      completa: this.completa,
      bandasFaltantes: this.bandasFaltantes(),
    };
  }
}
