import { ResumenIndices } from '../entities/analisis-vuelo.entity';
import { DistribucionCobertura } from '../value-objects/cobertura.vo';
import { Coordenada } from '../value-objects/coordenada.vo';
import { EstadisticasIndice } from '../value-objects/estadisticas-indice.vo';
import { InterpretacionCaptura, SintesisVuelo } from '../value-objects/interpretacion-ia.vo';
import { DistribucionClases } from '../value-objects/umbrales-ndvi.vo';

export interface DatosInterpretacionCaptura {
  rutaImagenRgb: string;
  altitudRelativaM: number | null;
  inclinacionCamaraGrados: number | null;
  contexto: string | null;
  ndvi: EstadisticasIndice;
  ndre: EstadisticasIndice;
  cobertura: DistribucionCobertura | null;
  distribucionNdvi: DistribucionClases;
}

export interface CapturaInterpretada {
  claveCaptura: string;
  ubicacion: Coordenada | null;
  ndviPromedio: number;
  interpretacion: InterpretacionCaptura;
}

export interface DatosSintesisVuelo {
  contexto: string | null;
  resumen: ResumenIndices;
  capturas: CapturaInterpretada[];
}

export interface InterpreteAgronomicoPort {
  interpretarCaptura(datos: DatosInterpretacionCaptura): Promise<InterpretacionCaptura>;
  sintetizarVuelo(datos: DatosSintesisVuelo): Promise<SintesisVuelo>;
}
