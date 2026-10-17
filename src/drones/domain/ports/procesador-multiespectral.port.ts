import { CalibracionBanda } from '../entities/captura.entity';
import { BandaMultiespectral } from '../value-objects/archivo-dji.vo';
import { DistribucionCobertura } from '../value-objects/cobertura.vo';
import { EstadisticasIndice } from '../value-objects/estadisticas-indice.vo';

export interface BandaParaProcesar {
  rutaLocal: string;
  calibracion: CalibracionBanda;
}

export type BandasParaProcesar = Record<BandaMultiespectral, BandaParaProcesar>;

export interface ResultadoProcesamiento {
  ndvi: EstadisticasIndice;
  ndre: EstadisticasIndice;
  gndvi: EstadisticasIndice;
  ndwi: EstadisticasIndice;
  cobertura: DistribucionCobertura;
  histogramaNdvi: number[];
}

export interface ProcesadorMultiespectralPort {
  procesar(bandas: BandasParaProcesar): Promise<ResultadoProcesamiento>;
}
