import { CultivoAptitud } from '../entities/cultivo-aptitud.entity';
import { PerfilTerreno } from '../value-objects/perfil-terreno.vo';

export type ClaseAptitud = 'ALTA' | 'MODERADA' | 'MARGINAL' | 'NO_APTO' | 'SIN_DATOS';

export type NombreFactor = 'COBERTURA' | 'ALTITUD' | 'TEMPERATURA' | 'PRECIPITACION' | 'PH' | 'PENDIENTE' | 'TEXTURA';

export interface FactorEvaluado {
  factor: NombreFactor;
  valor: number | string | null;
  rangoOptimo: string;
  puntaje: number | null;
  limitante: boolean;
  mensaje: string;
}

export interface AptitudCultivo {
  codigo: string;
  nombre: string;
  puntaje: number;
  clase: ClaseAptitud;
  confianzaPct: number;
  factores: FactorEvaluado[];
  limitantes: string[];
}

const MARGENES = {
  ALTITUD: 300,
  TEMPERATURA: 3,
  PRECIPITACION: 500,
  PH: 0.8,
  PENDIENTE: 15,
};

const SEMBRABLE_MINIMO = 10;
const SEMBRABLE_PLENO = 60;
const PUNTAJE_RIEGO = 0.6;
const PUNTAJE_TEXTURA_NO_PREFERIDA = 0.7;
const UMBRAL_LIMITANTE = 0.7;
const TOTAL_FACTORES = 7;
const PUNTAJE_MAXIMO_SIN_COBERTURA = 79;

export class EvaluadorAptitud {
  static evaluar(perfil: PerfilTerreno, cultivos: CultivoAptitud[]): AptitudCultivo[] {
    return cultivos
      .map((cultivo) => EvaluadorAptitud.evaluarCultivo(perfil, cultivo))
      .sort((a, b) => b.puntaje - a.puntaje);
  }

  static evaluarCultivo(perfil: PerfilTerreno, cultivo: CultivoAptitud): AptitudCultivo {
    const factores: FactorEvaluado[] = [
      EvaluadorAptitud.cobertura(perfil),
      EvaluadorAptitud.rango('ALTITUD', perfil.topografia?.altitudPromedioM ?? null, cultivo.altitudMinM, cultivo.altitudMaxM, MARGENES.ALTITUD, 'm s.n.m.'),
      EvaluadorAptitud.rango('TEMPERATURA', perfil.clima?.temperaturaMediaC ?? null, cultivo.temperaturaMinC, cultivo.temperaturaMaxC, MARGENES.TEMPERATURA, '°C'),
      EvaluadorAptitud.precipitacion(perfil, cultivo),
      EvaluadorAptitud.rango('PH', perfil.suelo?.ph ?? null, cultivo.phMin, cultivo.phMax, MARGENES.PH, ''),
      EvaluadorAptitud.pendiente(perfil, cultivo),
      EvaluadorAptitud.textura(perfil, cultivo),
    ];

    const evaluados = factores.filter((f) => f.puntaje !== null);
    const limitantes = factores.filter((f) => f.limitante).map((f) => f.mensaje);
    const confianzaPct = Math.round((evaluados.length * 100) / TOTAL_FACTORES);

    if (evaluados.length === 0) {
      return { codigo: cultivo.codigo, nombre: cultivo.nombre, puntaje: 0, clase: 'SIN_DATOS', confianzaPct, factores, limitantes };
    }

    const puntajes = evaluados.map((f) => f.puntaje as number);
    const minimo = Math.min(...puntajes);
    const promedio = puntajes.reduce((a, b) => a + b, 0) / puntajes.length;
    let puntaje = minimo === 0 ? 0 : Math.round(100 * (0.6 * minimo + 0.4 * promedio));
    const areaVerificada = perfil.cobertura?.areaVerificadaPct ?? 100;
    if (factores[0].puntaje === null && puntaje > PUNTAJE_MAXIMO_SIN_COBERTURA) {
      puntaje = PUNTAJE_MAXIMO_SIN_COBERTURA;
      limitantes.push('No se verificó qué hay sobre el terreno (construcciones, agua, bosque): aptitud limitada a moderada');
    } else if (areaVerificada < 100 && puntaje > PUNTAJE_MAXIMO_SIN_COBERTURA) {
      puntaje = PUNTAJE_MAXIMO_SIN_COBERTURA;
      limitantes.push(`Solo se verificó el ${areaVerificada} % del terreno: aptitud limitada a moderada`);
    }

    return {
      codigo: cultivo.codigo,
      nombre: cultivo.nombre,
      puntaje,
      clase: EvaluadorAptitud.clasificar(puntaje),
      confianzaPct,
      factores,
      limitantes,
    };
  }

  private static clasificar(puntaje: number): ClaseAptitud {
    if (puntaje >= 80) return 'ALTA';
    if (puntaje >= 60) return 'MODERADA';
    if (puntaje >= 40) return 'MARGINAL';
    return 'NO_APTO';
  }

  private static sinDato(factor: NombreFactor, rangoOptimo: string): FactorEvaluado {
    return { factor, valor: null, rangoOptimo, puntaje: null, limitante: false, mensaje: `Sin dato de ${factor.toLowerCase()}` };
  }

  private static rango(
    factor: NombreFactor,
    valor: number | null,
    min: number,
    max: number,
    margen: number,
    unidad: string,
  ): FactorEvaluado {
    const rangoOptimo = `${min} – ${max} ${unidad}`.trim();
    if (valor === null) return EvaluadorAptitud.sinDato(factor, rangoOptimo);
    if (valor >= min && valor <= max) {
      return { factor, valor, rangoOptimo, puntaje: 1, limitante: false, mensaje: `${factor} dentro del rango óptimo` };
    }
    const distancia = valor < min ? min - valor : valor - max;
    const sentido = valor < min ? 'por debajo' : 'por encima';
    const puntaje = distancia >= margen ? 0 : Math.round((1 - 0.6 * (distancia / margen)) * 100) / 100;
    const mensaje =
      puntaje === 0
        ? `${factor} ${sentido} del rango tolerable (${valor} ${unidad}, óptimo ${rangoOptimo})`
        : `${factor} ligeramente ${sentido} del óptimo (${valor} ${unidad}, óptimo ${rangoOptimo})`;
    return { factor, valor, rangoOptimo, puntaje, limitante: puntaje < UMBRAL_LIMITANTE, mensaje: mensaje.trim() };
  }

  private static precipitacion(perfil: PerfilTerreno, cultivo: CultivoAptitud): FactorEvaluado {
    const valor = perfil.clima?.precipitacionAnualMm ?? null;
    const base = EvaluadorAptitud.rango('PRECIPITACION', valor, cultivo.precipitacionMinMm, cultivo.precipitacionMaxMm, MARGENES.PRECIPITACION, 'mm/año');
    if (valor === null || base.puntaje === null || valor >= cultivo.precipitacionMinMm) return base;
    const puntaje = Math.max(PUNTAJE_RIEGO, base.puntaje);
    return {
      ...base,
      puntaje,
      limitante: true,
      mensaje: `Déficit de lluvia (${valor} mm/año, mínimo ${cultivo.precipitacionMinMm}): requiere riego`,
    };
  }

  private static pendiente(perfil: PerfilTerreno, cultivo: CultivoAptitud): FactorEvaluado {
    const valor = perfil.topografia?.pendientePct ?? null;
    const rangoOptimo = `≤ ${cultivo.pendienteMaxPct} %`;
    if (valor === null) return EvaluadorAptitud.sinDato('PENDIENTE', rangoOptimo);
    if (valor <= cultivo.pendienteMaxPct) {
      return { factor: 'PENDIENTE', valor, rangoOptimo, puntaje: 1, limitante: false, mensaje: 'Pendiente adecuada' };
    }
    const exceso = valor - cultivo.pendienteMaxPct;
    const puntaje = exceso >= MARGENES.PENDIENTE ? 0 : Math.round((1 - 0.6 * (exceso / MARGENES.PENDIENTE)) * 100) / 100;
    return {
      factor: 'PENDIENTE',
      valor,
      rangoOptimo,
      puntaje,
      limitante: true,
      mensaje:
        puntaje === 0
          ? `Pendiente de ${valor} % demasiado fuerte para ${cultivo.nombre} (máximo ${cultivo.pendienteMaxPct} %)`
          : `Pendiente de ${valor} %: requiere obras de conservación de suelo`,
    };
  }

  private static textura(perfil: PerfilTerreno, cultivo: CultivoAptitud): FactorEvaluado {
    const valor = perfil.suelo?.textura ?? null;
    const rangoOptimo = cultivo.texturasPreferidas.join(', ') || 'cualquiera';
    if (valor === null) return EvaluadorAptitud.sinDato('TEXTURA', rangoOptimo);
    if (cultivo.texturasPreferidas.length === 0 || cultivo.texturasPreferidas.includes(valor)) {
      return { factor: 'TEXTURA', valor, rangoOptimo, puntaje: 1, limitante: false, mensaje: 'Textura de suelo adecuada' };
    }
    return {
      factor: 'TEXTURA',
      valor,
      rangoOptimo,
      puntaje: PUNTAJE_TEXTURA_NO_PREFERIDA,
      limitante: false,
      mensaje: `Suelo ${valor.toLowerCase().replace('_', ' ')}: no es el preferido, mejorar con materia orgánica`,
    };
  }

  private static cobertura(perfil: PerfilTerreno): FactorEvaluado {
    const cobertura = perfil.cobertura;
    const rangoOptimo = `≥ ${SEMBRABLE_PLENO} % del área sembrable`;
    if (!cobertura) return EvaluadorAptitud.sinDato('COBERTURA', rangoOptimo);
    const valor = cobertura.porcentajeSembrable;
    if (valor < SEMBRABLE_MINIMO) {
      return {
        factor: 'COBERTURA',
        valor,
        rangoOptimo,
        puntaje: 0,
        limitante: true,
        mensaje: `Solo el ${valor} % del terreno es sembrable: predominan construcciones, vías, agua o bosque`,
      };
    }
    const puntaje = Math.min(1, Math.round((valor / SEMBRABLE_PLENO) * 100) / 100);
    return {
      factor: 'COBERTURA',
      valor,
      rangoOptimo,
      puntaje,
      limitante: puntaje < UMBRAL_LIMITANTE,
      mensaje: puntaje < 1 ? `Solo el ${valor} % del terreno está libre para sembrar` : 'Terreno mayormente libre para sembrar',
    };
  }
}
