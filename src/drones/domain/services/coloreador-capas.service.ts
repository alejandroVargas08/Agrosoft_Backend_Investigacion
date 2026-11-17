import type { IndiceMapa, MapaIndice } from '../ports/procesador-multiespectral.port';
import { ClaseVegetacion, UmbralesNdvi } from '../value-objects/umbrales-ndvi.vo';

export type CapaCaptura = IndiceMapa | 'CLASIFICACION';

type Color = [number, number, number];

interface Escala {
  minimo: number;
  maximo: number;
  colores: Color[];
}

const ESCALA_VEGETACION: Color[] = [
  [215, 48, 39],
  [252, 141, 89],
  [254, 224, 139],
  [145, 207, 96],
  [26, 152, 80],
];

const ESCALA_AGUA: Color[] = [
  [166, 97, 26],
  [223, 194, 125],
  [245, 245, 245],
  [128, 205, 193],
  [44, 123, 182],
];

const ESCALAS: Record<IndiceMapa, Escala> = {
  NDVI: { minimo: -0.1, maximo: 0.9, colores: ESCALA_VEGETACION },
  GNDVI: { minimo: -0.1, maximo: 0.9, colores: ESCALA_VEGETACION },
  NDRE: { minimo: -0.05, maximo: 0.6, colores: ESCALA_VEGETACION },
  NDWI: { minimo: -0.6, maximo: 0.4, colores: ESCALA_AGUA },
};

const COLOR_CLASE: Record<ClaseVegetacion, Color> = {
  SIN_VEGETACION: [156, 163, 175],
  ESTRES_ALTO: [220, 38, 38],
  ESTRES_MODERADO: [245, 158, 11],
  SALUDABLE: [16, 185, 129],
};

export class ColoreadorCapas {
  static leyenda(capa: CapaCaptura): { minimo: number; maximo: number; colores: string[] } | null {
    if (capa === 'CLASIFICACION') return null;
    const escala = ESCALAS[capa];
    return { minimo: escala.minimo, maximo: escala.maximo, colores: escala.colores.map(ColoreadorCapas.hex) };
  }

  static colorear(mapa: MapaIndice, capa: CapaCaptura, umbrales: UmbralesNdvi): Uint8Array {
    const pixeles = new Uint8Array(mapa.ancho * mapa.alto * 4);
    for (let i = 0; i < mapa.ancho * mapa.alto; i++) {
      const valor = mapa.valores[i];
      if (!Number.isFinite(valor)) continue;
      const color = capa === 'CLASIFICACION' ? COLOR_CLASE[umbrales.clasificar(valor)] : ColoreadorCapas.interpolar(valor, ESCALAS[capa]);
      pixeles[i * 4] = color[0];
      pixeles[i * 4 + 1] = color[1];
      pixeles[i * 4 + 2] = color[2];
      pixeles[i * 4 + 3] = 255;
    }
    return pixeles;
  }

  private static interpolar(valor: number, escala: Escala): Color {
    const t = Math.min(1, Math.max(0, (valor - escala.minimo) / (escala.maximo - escala.minimo)));
    const tramos = escala.colores.length - 1;
    const posicion = t * tramos;
    const indice = Math.min(tramos - 1, Math.floor(posicion));
    const fraccion = posicion - indice;
    const a = escala.colores[indice];
    const b = escala.colores[indice + 1];
    return [
      Math.round(a[0] + (b[0] - a[0]) * fraccion),
      Math.round(a[1] + (b[1] - a[1]) * fraccion),
      Math.round(a[2] + (b[2] - a[2]) * fraccion),
    ];
  }

  private static hex(color: Color): string {
    return '#' + color.map((c) => c.toString(16).padStart(2, '0')).join('');
  }
}
