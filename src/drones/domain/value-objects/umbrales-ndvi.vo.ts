import { redondear } from './estadisticas-indice.vo';

export type ClaseVegetacion = 'SIN_VEGETACION' | 'ESTRES_ALTO' | 'ESTRES_MODERADO' | 'SALUDABLE';
export type DistribucionClases = Record<ClaseVegetacion, number>;

export const BINS_HISTOGRAMA_NDVI = 200;

export interface UmbralesNdviProps {
  sinVegetacion: number;
  estresAlto: number;
  saludable: number;
  porcentajeCritico: number;
}

export class UmbralesNdvi {
  private constructor(
    public readonly sinVegetacion: number,
    public readonly estresAlto: number,
    public readonly saludable: number,
    public readonly porcentajeCritico: number,
  ) {}

  static porDefecto(): UmbralesNdvi {
    return new UmbralesNdvi(0.2, 0.4, 0.6, 30);
  }

  static crear(valores: Partial<UmbralesNdviProps>): UmbralesNdvi {
    const base = UmbralesNdvi.porDefecto();
    const sinVegetacion = valores.sinVegetacion ?? base.sinVegetacion;
    const estresAlto = valores.estresAlto ?? base.estresAlto;
    const saludable = valores.saludable ?? base.saludable;
    const porcentajeCritico = valores.porcentajeCritico ?? base.porcentajeCritico;

    if (!(sinVegetacion >= -1 && sinVegetacion < estresAlto && estresAlto < saludable && saludable <= 1)) {
      throw new Error('Los umbrales NDVI deben cumplir -1 ≤ sinVegetacion < estresAlto < saludable ≤ 1');
    }
    if (porcentajeCritico <= 0 || porcentajeCritico > 100) {
      throw new Error('El porcentaje crítico debe estar entre 0 y 100');
    }
    return new UmbralesNdvi(sinVegetacion, estresAlto, saludable, porcentajeCritico);
  }

  clasificar(valor: number): ClaseVegetacion {
    if (valor < this.sinVegetacion) return 'SIN_VEGETACION';
    if (valor < this.estresAlto) return 'ESTRES_ALTO';
    if (valor < this.saludable) return 'ESTRES_MODERADO';
    return 'SALUDABLE';
  }

  distribucion(histograma: number[]): DistribucionClases {
    const conteo: DistribucionClases = { SIN_VEGETACION: 0, ESTRES_ALTO: 0, ESTRES_MODERADO: 0, SALUDABLE: 0 };
    const ancho = 2 / histograma.length;
    let total = 0;

    histograma.forEach((cantidad, i) => {
      const centro = -1 + ancho * (i + 0.5);
      conteo[this.clasificar(centro)] += cantidad;
      total += cantidad;
    });

    if (total === 0) return conteo;
    for (const clase of Object.keys(conteo) as ClaseVegetacion[]) {
      conteo[clase] = redondear((conteo[clase] * 100) / total, 2);
    }
    return conteo;
  }

  esCritica(distribucion: DistribucionClases): boolean {
    return distribucion.ESTRES_ALTO >= this.porcentajeCritico;
  }

  toProps(): UmbralesNdviProps {
    return {
      sinVegetacion: this.sinVegetacion,
      estresAlto: this.estresAlto,
      saludable: this.saludable,
      porcentajeCritico: this.porcentajeCritico,
    };
  }
}

