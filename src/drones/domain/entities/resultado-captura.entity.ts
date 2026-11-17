import { DistribucionCobertura } from '../value-objects/cobertura.vo';
import { Coordenada } from '../value-objects/coordenada.vo';
import { EstadisticasIndice } from '../value-objects/estadisticas-indice.vo';
import { InterpretacionCaptura } from '../value-objects/interpretacion-ia.vo';
import { ClaseVegetacion, DistribucionClases, UmbralesNdvi } from '../value-objects/umbrales-ndvi.vo';

interface ResultadoCapturaProps {
  id: number | null;
  analisisId: number;
  capturaId: number;
  ubicacion: Coordenada | null;
  ndvi: EstadisticasIndice;
  ndre: EstadisticasIndice;
  gndvi: EstadisticasIndice;
  ndwi: EstadisticasIndice | null;
  cobertura: DistribucionCobertura | null;
  histogramaNdvi: number[];
  distribucionNdvi: DistribucionClases;
  clasificacion: ClaseVegetacion;
  esCritica: boolean;
  interpretacionIa: InterpretacionCaptura | null;
  creadoEn?: Date;
}

type DatosProcesados = Pick<
  ResultadoCapturaProps,
  'analisisId' | 'capturaId' | 'ubicacion' | 'ndvi' | 'ndre' | 'gndvi' | 'ndwi' | 'cobertura' | 'histogramaNdvi'
>;

export class ResultadoCaptura {
  private constructor(private props: ResultadoCapturaProps) {}

  static crear(datos: DatosProcesados, umbrales: UmbralesNdvi): ResultadoCaptura {
    const distribucionNdvi = umbrales.distribucion(datos.histogramaNdvi);
    return new ResultadoCaptura({
      ...datos,
      id: null,
      distribucionNdvi,
      clasificacion: umbrales.clasificar(datos.ndvi.promedio),
      esCritica: umbrales.esCritica(distribucionNdvi),
      interpretacionIa: null,
    });
  }

  static desdePersistencia(props: ResultadoCapturaProps): ResultadoCaptura {
    return new ResultadoCaptura(props);
  }

  registrarInterpretacion(interpretacion: InterpretacionCaptura): void {
    this.props.interpretacionIa = interpretacion;
  }

  get id() { return this.props.id; }
  get analisisId() { return this.props.analisisId; }
  get capturaId() { return this.props.capturaId; }
  get ubicacion() { return this.props.ubicacion; }
  get ndvi() { return this.props.ndvi; }
  get ndre() { return this.props.ndre; }
  get gndvi() { return this.props.gndvi; }
  get ndwi() { return this.props.ndwi; }
  get cobertura() { return this.props.cobertura; }
  get histogramaNdvi() { return this.props.histogramaNdvi; }
  get distribucionNdvi() { return this.props.distribucionNdvi; }
  get clasificacion() { return this.props.clasificacion; }
  get esCritica() { return this.props.esCritica; }
  get interpretacionIa() { return this.props.interpretacionIa; }
  get creadoEn() { return this.props.creadoEn; }

  toProps(): ResultadoCapturaProps { return { ...this.props }; }

  toJSON() {
    const { histogramaNdvi, ...resto } = this.props;
    return resto;
  }
}
