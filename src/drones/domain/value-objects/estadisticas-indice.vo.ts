export interface EstadisticasIndice {
  promedio: number;
  minimo: number;
  maximo: number;
  desviacion: number;
  pixelesValidos: number;
}

export class CombinadorEstadisticas {
  static combinar(lista: EstadisticasIndice[]): EstadisticasIndice | null {
    const validas = lista.filter((e) => e.pixelesValidos > 0);
    if (validas.length === 0) return null;

    let n = 0;
    let media = 0;
    let m2 = 0;
    let minimo = Infinity;
    let maximo = -Infinity;

    for (const e of validas) {
      const nb = e.pixelesValidos;
      const delta = e.promedio - media;
      const total = n + nb;
      m2 += e.desviacion ** 2 * nb + (delta ** 2 * n * nb) / total;
      media += (delta * nb) / total;
      n = total;
      minimo = Math.min(minimo, e.minimo);
      maximo = Math.max(maximo, e.maximo);
    }

    return {
      promedio: redondear(media),
      minimo: redondear(minimo),
      maximo: redondear(maximo),
      desviacion: redondear(Math.sqrt(m2 / n)),
      pixelesValidos: n,
    };
  }
}

export function redondear(valor: number, decimales = 4): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}
