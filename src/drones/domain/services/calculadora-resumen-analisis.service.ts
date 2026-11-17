import { ResumenIndices } from '../entities/analisis-vuelo.entity';
import { ResultadoCaptura } from '../entities/resultado-captura.entity';
import { CombinadorCobertura, CoberturaPonderada } from '../value-objects/cobertura.vo';
import { CombinadorEstadisticas, EstadisticasIndice } from '../value-objects/estadisticas-indice.vo';
import { BINS_HISTOGRAMA_NDVI, UmbralesNdvi } from '../value-objects/umbrales-ndvi.vo';

export class CalculadoraResumenAnalisis {
  static calcular(resultados: ResultadoCaptura[], umbrales: UmbralesNdvi, capturasOmitidas: number): ResumenIndices {
    const histograma = new Array<number>(BINS_HISTOGRAMA_NDVI).fill(0);
    for (const resultado of resultados) {
      resultado.histogramaNdvi.forEach((cantidad, i) => {
        histograma[i] += cantidad;
      });
    }

    const ndwi = resultados.map((r) => r.ndwi).filter((e): e is EstadisticasIndice => e !== null);
    const coberturas: CoberturaPonderada[] = resultados
      .filter((r) => r.cobertura !== null)
      .map((r) => ({ cobertura: r.cobertura as NonNullable<typeof r.cobertura>, peso: r.ndvi.pixelesValidos }));

    return {
      ndvi: CombinadorEstadisticas.combinar(resultados.map((r) => r.ndvi)),
      ndre: CombinadorEstadisticas.combinar(resultados.map((r) => r.ndre)),
      gndvi: CombinadorEstadisticas.combinar(resultados.map((r) => r.gndvi)),
      ndwi: CombinadorEstadisticas.combinar(ndwi),
      cobertura: CombinadorCobertura.combinar(coberturas),
      distribucionNdvi: umbrales.distribucion(histograma),
      capturasAnalizadas: resultados.length,
      capturasCriticas: resultados.filter((r) => r.esCritica).length,
      capturasOmitidas,
    };
  }
}
