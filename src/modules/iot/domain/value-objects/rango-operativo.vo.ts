export type TipoAlerta = 'MINIMO' | 'MAXIMO';

export interface ResultadoEvaluacion {
  violado: boolean;
  tipo: TipoAlerta | null;
  umbral: number | null;
}

export class RangoOperativo {
  private constructor(
    public readonly minimo: number,
    public readonly maximo: number,
  ) {}

  static crear(minimo: number, maximo: number): RangoOperativo {
    if (minimo >= maximo) {
      throw new Error('El valor mínimo debe ser menor que el valor máximo');
    }
    return new RangoOperativo(minimo, maximo);
  }

  // Método nuevo
  evaluar(valor: number): ResultadoEvaluacion {
    if (valor < this.minimo) {
      return { violado: true, tipo: 'MINIMO', umbral: this.minimo };
    }
    if (valor > this.maximo) {
      return { violado: true, tipo: 'MAXIMO', umbral: this.maximo };
    }
    return { violado: false, tipo: null, umbral: null };
  }
}