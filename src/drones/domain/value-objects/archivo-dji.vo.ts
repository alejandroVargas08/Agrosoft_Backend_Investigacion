export type Banda = 'RGB' | 'G' | 'R' | 'RE' | 'NIR';
export type BandaMultiespectral = Exclude<Banda, 'RGB'>;
export const BANDAS_MULTIESPECTRALES: BandaMultiespectral[] = ['G', 'R', 'RE', 'NIR'];

const PATRON_NOMBRE = /^DJI_(\d{14})_(\d{4})_(D|MS_G|MS_R|MS_RE|MS_NIR)\.(jpe?g|tiff?)$/i;

const BANDA_POR_SUFIJO: Record<string, Banda> = {
  D: 'RGB',
  MS_G: 'G',
  MS_R: 'R',
  MS_RE: 'RE',
  MS_NIR: 'NIR',
};

export class ArchivoDji {
  private constructor(
    public readonly nombre: string,
    public readonly claveCaptura: string,
    public readonly numeroCaptura: number,
    public readonly banda: Banda,
  ) {}

  static interpretar(nombre: string): ArchivoDji | null {
    const coincidencia = PATRON_NOMBRE.exec(nombre);
    if (!coincidencia) return null;
    const [, marcaTiempo, numero, sufijo] = coincidencia;
    return new ArchivoDji(nombre, `${marcaTiempo}_${numero}`, Number(numero), BANDA_POR_SUFIJO[sufijo.toUpperCase()]);
  }
}
