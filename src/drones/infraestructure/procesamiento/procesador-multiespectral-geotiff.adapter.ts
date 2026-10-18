import { Injectable } from '@nestjs/common';
import { fromFile } from 'geotiff';
import type {
  BandaParaProcesar,
  BandasParaProcesar,
  ProcesadorMultiespectralPort,
  ResultadoProcesamiento,
} from '../../domain/ports/procesador-multiespectral.port';
import { EstadisticasIndice, redondear } from '../../domain/value-objects/estadisticas-indice.vo';
import { ClaseCobertura, CombinadorCobertura } from '../../domain/value-objects/cobertura.vo';
import { BINS_HISTOGRAMA_NDVI } from '../../domain/value-objects/umbrales-ndvi.vo';

const MARGEN_RECORTE = 0.1;
const FACTOR_REDUCCION = 4;
const VALOR_SATURADO = 65535;
const UMBRAL_VEGETACION_NDVI = 0.2;
const UMBRAL_VEGETACION_REFERENCIA = 0.5;
const MINIMO_PIXELES_REFERENCIA = 500;
const FACTOR_OSCURIDAD_AGUA = 0.3;
const UMBRAL_AGUA_NDWI_SIN_REFERENCIA = 0.2;

class AcumuladorEstadisticas {
  private n = 0;
  private media = 0;
  private m2 = 0;
  private minimo = Infinity;
  private maximo = -Infinity;

  agregar(valor: number): void {
    this.n++;
    const delta = valor - this.media;
    this.media += delta / this.n;
    this.m2 += delta * (valor - this.media);
    if (valor < this.minimo) this.minimo = valor;
    if (valor > this.maximo) this.maximo = valor;
  }

  resultado(): EstadisticasIndice {
    if (this.n === 0) return { promedio: 0, minimo: 0, maximo: 0, desviacion: 0, pixelesValidos: 0 };
    return {
      promedio: redondear(this.media),
      minimo: redondear(this.minimo),
      maximo: redondear(this.maximo),
      desviacion: redondear(Math.sqrt(this.m2 / this.n)),
      pixelesValidos: this.n,
    };
  }
}

function indiceNormalizado(a: number, b: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const suma = a + b;
  if (suma <= 0) return null;
  return (a - b) / suma;
}

function mediana(valores: number[]): number {
  const ordenados = Float64Array.from(valores).sort();
  const mitad = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 ? ordenados[mitad] : (ordenados[mitad - 1] + ordenados[mitad]) / 2;
}

@Injectable()
export class ProcesadorMultiespectralGeotiffAdapter implements ProcesadorMultiespectralPort {
  async procesar(bandas: BandasParaProcesar): Promise<ResultadoProcesamiento> {
    const [verde, rojo, bordeRojo, nir] = await Promise.all([
      this.leerReflectancia(bandas.G),
      this.leerReflectancia(bandas.R),
      this.leerReflectancia(bandas.RE),
      this.leerReflectancia(bandas.NIR),
    ]);

    const total = Math.min(verde.length, rojo.length, bordeRojo.length, nir.length);
    const ndviPorPixel = new Float32Array(total);
    const nirVegetacionDensa: number[] = [];

    for (let i = 0; i < total; i++) {
      const valorNdvi = indiceNormalizado(nir[i], rojo[i]);
      ndviPorPixel[i] = valorNdvi ?? NaN;
      if (valorNdvi !== null && valorNdvi >= UMBRAL_VEGETACION_REFERENCIA) nirVegetacionDensa.push(nir[i]);
    }

    const referenciaNir = nirVegetacionDensa.length >= MINIMO_PIXELES_REFERENCIA ? mediana(nirVegetacionDensa) : null;

    const ndvi = new AcumuladorEstadisticas();
    const ndre = new AcumuladorEstadisticas();
    const gndvi = new AcumuladorEstadisticas();
    const ndwi = new AcumuladorEstadisticas();
    const histogramaNdvi = new Array<number>(BINS_HISTOGRAMA_NDVI).fill(0);
    const conteoCobertura = CombinadorCobertura.vacia();

    for (let i = 0; i < total; i++) {
      const valorNdvi = ndviPorPixel[i];
      const valorNdwi = indiceNormalizado(verde[i], nir[i]);
      if (valorNdwi !== null) ndwi.agregar(valorNdwi);

      const valorNdre = indiceNormalizado(nir[i], bordeRojo[i]);
      if (valorNdre !== null) ndre.agregar(valorNdre);

      const valorGndvi = indiceNormalizado(nir[i], verde[i]);
      if (valorGndvi !== null) gndvi.agregar(valorGndvi);

      if (Number.isNaN(valorNdvi)) continue;

      ndvi.agregar(valorNdvi);
      const bin = Math.min(BINS_HISTOGRAMA_NDVI - 1, Math.floor(((valorNdvi + 1) / 2) * BINS_HISTOGRAMA_NDVI));
      histogramaNdvi[bin]++;

      conteoCobertura[this.clasificarCobertura(valorNdvi, valorNdwi, nir[i], referenciaNir)]++;
    }

    return {
      ndvi: ndvi.resultado(),
      ndre: ndre.resultado(),
      gndvi: gndvi.resultado(),
      ndwi: ndwi.resultado(),
      cobertura: CombinadorCobertura.desdeConteos(conteoCobertura),
      histogramaNdvi,
    };
  }

  private clasificarCobertura(
    valorNdvi: number,
    valorNdwi: number | null,
    valorNir: number,
    referenciaNir: number | null,
  ): ClaseCobertura {
    if (valorNdvi >= UMBRAL_VEGETACION_NDVI) return 'VEGETACION';
    const esAgua =
      referenciaNir !== null
        ? valorNir < referenciaNir * FACTOR_OSCURIDAD_AGUA
        : valorNdwi !== null && valorNdwi > UMBRAL_AGUA_NDWI_SIN_REFERENCIA;
    return esAgua ? 'AGUA' : 'SIN_VEGETACION';
  }

  private async leerReflectancia(banda: BandaParaProcesar): Promise<Float32Array> {
    const tiff = await fromFile(banda.rutaLocal);
    try {
      const imagen = await tiff.getImage();
      const ancho = imagen.getWidth();
      const alto = imagen.getHeight();
      const x0 = Math.floor(ancho * MARGEN_RECORTE);
      const y0 = Math.floor(alto * MARGEN_RECORTE);
      const x1 = ancho - x0;
      const y1 = alto - y0;
      const anchoSalida = Math.max(1, Math.floor((x1 - x0) / FACTOR_REDUCCION));
      const altoSalida = Math.max(1, Math.floor((y1 - y0) / FACTOR_REDUCCION));

      const rasters = await imagen.readRasters({
        window: [x0, y0, x1, y1],
        width: anchoSalida,
        height: altoSalida,
        resampleMethod: 'nearest',
        interleave: false,
      });
      const datos = (rasters as unknown as ArrayLike<number>[])[0];

      const {
        blackLevel,
        ganancia,
        exposicionSeg,
        ajusteGanancia,
        irradiancia,
        vineteo,
        centroOpticoX,
        centroOpticoY,
      } = banda.calibracion;

      const negro = blackLevel ?? 0;
      const factorSensor = ganancia && exposicionSeg ? ganancia * exposicionSeg : 1;
      const factorLuz = irradiancia && irradiancia > 0 ? irradiancia : 1;
      const factorCamara = ajusteGanancia && ajusteGanancia > 0 ? ajusteGanancia : 1;
      const escala = factorCamara / (factorSensor * factorLuz);

      const aplicarVineteo = vineteo !== null && vineteo.length === 6 && centroOpticoX !== null && centroOpticoY !== null;
      const pasoX = (x1 - x0) / anchoSalida;
      const pasoY = (y1 - y0) / altoSalida;

      const reflectancia = new Float32Array(datos.length);
      for (let i = 0; i < datos.length; i++) {
        const valor = datos[i];
        if (valor >= VALOR_SATURADO || valor <= negro) {
          reflectancia[i] = NaN;
          continue;
        }

        let correccion = 1;
        if (aplicarVineteo) {
          const columna = i % anchoSalida;
          const fila = Math.floor(i / anchoSalida);
          const x = x0 + (columna + 0.5) * pasoX;
          const y = y0 + (fila + 0.5) * pasoY;
          const r = Math.hypot(x - (centroOpticoX as number), y - (centroOpticoY as number));
          let potencia = r;
          for (const k of vineteo as number[]) {
            correccion += k * potencia;
            potencia *= r;
          }
        }

        reflectancia[i] = (valor - negro) * correccion * escala;
      }
      return reflectancia;
    } finally {
      await tiff.close();
    }
  }
}
