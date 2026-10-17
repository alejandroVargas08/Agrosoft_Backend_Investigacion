import { ResumenAnalisis } from '../entities/analisis-vuelo.entity';
import { ResultadoCaptura } from '../entities/resultado-captura.entity';
import { CombinadorEstadisticas } from '../value-objects/estadisticas-indice.vo';
import { BINS_HISTOGRAMA_NDVI, UmbralesNdvi } from '../value-objects/umbrales-ndvi.vo';

export class CalculadoraResumenAnalisis {
  static calcular(resultados: ResultadoCaptura[], umbrales: UmbralesNdvi, capturasOmitidas: number): ResumenAnalisis {
    const histograma = new Array<number>(BINS_HISTOGRAMA_NDVI).fill(0);
    for (const resultado of resultados) {
      resultado.histogramaNdvi.forEach((cantidad, i) => {
        histograma[i] += cantidad;
      });
    }

    return {
      ndvi: CombinadorEstadisticas.combinar(resultados.map((r) => r.ndvi)),
      ndre: CombinadorEstadisticas.combinar(resultados.map((r) => r.ndre)),
      gndvi: CombinadorEstadisticas.combinar(resultados.map((r) => r.gndvi)),
      distribucionNdvi: umbrales.distribucion(histograma),
      capturasAnalizadas: resultados.length,
      capturasCriticas: resultados.filter((r) => r.esCritica).length,
      capturasOmitidas,
    };
  }
}
