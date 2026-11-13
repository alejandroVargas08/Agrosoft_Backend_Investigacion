import { ClaseTextura } from '../value-objects/perfil-terreno.vo';

export interface CultivoAptitudProps {
  id: number | null;
  codigo: string;
  nombre: string;
  altitudMinM: number;
  altitudMaxM: number;
  temperaturaMinC: number;
  temperaturaMaxC: number;
  precipitacionMinMm: number;
  precipitacionMaxMm: number;
  phMin: number;
  phMax: number;
  pendienteMaxPct: number;
  texturasPreferidas: ClaseTextura[];
  distanciaSurcosM: number;
  distanciaPlantasM: number;
  cicloDias: number;
  perenne: boolean;
  notas: string | null;
  activo: boolean;
}

export class CultivoAptitud {
  private constructor(private readonly props: CultivoAptitudProps) {}

  static crear(input: Omit<CultivoAptitudProps, 'id' | 'activo'>): CultivoAptitud {
    const pares: [number, number, string][] = [
      [input.altitudMinM, input.altitudMaxM, 'altitud'],
      [input.temperaturaMinC, input.temperaturaMaxC, 'temperatura'],
      [input.precipitacionMinMm, input.precipitacionMaxMm, 'precipitación'],
      [input.phMin, input.phMax, 'pH'],
    ];
    for (const [min, max, nombre] of pares) {
      if (min > max) throw new Error(`El rango de ${nombre} de ${input.nombre} es inválido`);
    }
    if (input.distanciaSurcosM <= 0 || input.distanciaPlantasM <= 0) {
      throw new Error(`Las distancias de siembra de ${input.nombre} deben ser mayores a cero`);
    }
    return new CultivoAptitud({ ...input, id: null, activo: true });
  }

  static desdePersistencia(props: CultivoAptitudProps): CultivoAptitud {
    return new CultivoAptitud(props);
  }

  get id() { return this.props.id; }
  get codigo() { return this.props.codigo; }
  get nombre() { return this.props.nombre; }
  get altitudMinM() { return this.props.altitudMinM; }
  get altitudMaxM() { return this.props.altitudMaxM; }
  get temperaturaMinC() { return this.props.temperaturaMinC; }
  get temperaturaMaxC() { return this.props.temperaturaMaxC; }
  get precipitacionMinMm() { return this.props.precipitacionMinMm; }
  get precipitacionMaxMm() { return this.props.precipitacionMaxMm; }
  get phMin() { return this.props.phMin; }
  get phMax() { return this.props.phMax; }
  get pendienteMaxPct() { return this.props.pendienteMaxPct; }
  get texturasPreferidas() { return this.props.texturasPreferidas; }
  get distanciaSurcosM() { return this.props.distanciaSurcosM; }
  get distanciaPlantasM() { return this.props.distanciaPlantasM; }
  get cicloDias() { return this.props.cicloDias; }
  get perenne() { return this.props.perenne; }
  get notas() { return this.props.notas; }
  get activo() { return this.props.activo; }

  toProps(): CultivoAptitudProps { return { ...this.props }; }
  toJSON() { return this.toProps(); }
}
