import { redondear } from './estadisticas-indice.vo';

export type ClaseCobertura = 'AGUA' | 'SIN_VEGETACION' | 'VEGETACION';
export type DistribucionCobertura = Record<ClaseCobertura, number>;

export interface CoberturaPonderada {
  cobertura: DistribucionCobertura;
  peso: number;
}

const CLASES: ClaseCobertura[] = ['AGUA', 'SIN_VEGETACION', 'VEGETACION'];

export class CombinadorCobertura {
  static vacia(): DistribucionCobertura {
    return { AGUA: 0, SIN_VEGETACION: 0, VEGETACION: 0 };
  }

  static desdeConteos(conteos: DistribucionCobertura): DistribucionCobertura {
    const total = CLASES.reduce((suma, clase) => suma + conteos[clase], 0);
    const resultado = CombinadorCobertura.vacia();
    if (total === 0) return resultado;
    for (const clase of CLASES) resultado[clase] = redondear((conteos[clase] * 100) / total, 2);
    return resultado;
  }

  static combinar(lista: CoberturaPonderada[]): DistribucionCobertura | null {
    const validas = lista.filter((item) => item.peso > 0);
    if (validas.length === 0) return null;
    const pesoTotal = validas.reduce((suma, item) => suma + item.peso, 0);
    const resultado = CombinadorCobertura.vacia();
    for (const item of validas) {
      for (const clase of CLASES) resultado[clase] += item.cobertura[clase] * item.peso;
    }
    for (const clase of CLASES) resultado[clase] = redondear(resultado[clase] / pesoTotal, 2);
    return resultado;
  }
}
