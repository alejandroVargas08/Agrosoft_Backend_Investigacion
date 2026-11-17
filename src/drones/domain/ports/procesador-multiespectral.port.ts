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

export type IndiceMapa = 'NDVI' | 'NDRE' | 'GNDVI' | 'NDWI';

export interface MapaIndice {
  ancho: number;
  alto: number;
  valores: Float32Array;
}

export interface ProcesadorMultiespectralPort {
  procesar(bandas: BandasParaProcesar): Promise<ResultadoProcesamiento>;
  generarMapa(bandas: BandasParaProcesar, indice: IndiceMapa): Promise<MapaIndice>;
}
