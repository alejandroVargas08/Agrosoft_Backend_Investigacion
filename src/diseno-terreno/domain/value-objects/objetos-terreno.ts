import { ProyeccionLocal, PuntoGeo } from './geo';

export type TipoObjeto = 'CONSTRUCCION' | 'VIA' | 'AGUA' | 'BOSQUE' | 'ARBOL';
export type FormaObjeto = 'POLIGONO' | 'LINEA' | 'PUNTO';
export type FuenteObjeto = 'OSM' | 'MICROSOFT' | 'IA_DRON';

export interface ObjetoTerreno {
  tipo: TipoObjeto;
  forma: FormaObjeto;
  puntos: PuntoGeo[];
  anchoM: number;
  nombre: string | null;
  fuente?: FuenteObjeto;
}

export interface ResumenObjetos {
  porcentajes: Partial<Record<TipoObjeto, number>>;
  porcentajeOcupado: number;
  conteo: Partial<Record<TipoObjeto, number>>;
}

interface Xy {
  x: number;
  y: number;
}

interface ObjetoLocal {
  tipo: TipoObjeto;
  forma: FormaObjeto;
  puntos: Xy[];
  radio: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const PRIORIDAD: TipoObjeto[] = ['CONSTRUCCION', 'VIA', 'AGUA', 'ARBOL', 'BOSQUE'];

function dentroDe(p: Xy, poligono: Xy[]): boolean {
  let resultado = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const a = poligono[i];
    const b = poligono[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) resultado = !resultado;
  }
  return resultado;
}

function distanciaASegmento(p: Xy, a: Xy, b: Xy): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const largo2 = dx * dx + dy * dy;
  const t = largo2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / largo2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function crearDetector(objetos: ObjetoTerreno[], proyeccion: ProyeccionLocal): (p: Xy) => TipoObjeto | null {
  const locales: ObjetoLocal[] = [...objetos]
    .sort((x, y) => PRIORIDAD.indexOf(x.tipo) - PRIORIDAD.indexOf(y.tipo))
    .map((o) => {
      const puntos = o.puntos.map((p) => proyeccion.aLocal(p));
      const radio = o.forma === 'POLIGONO' ? 0 : o.anchoM / 2;
      const xs = puntos.map((p) => p.x);
      const ys = puntos.map((p) => p.y);
      return {
        tipo: o.tipo,
        forma: o.forma,
        puntos,
        radio,
        minX: Math.min(...xs) - radio,
        maxX: Math.max(...xs) + radio,
        minY: Math.min(...ys) - radio,
        maxY: Math.max(...ys) + radio,
      };
    });

  return (p: Xy) => {
    for (const o of locales) {
      if (p.x < o.minX || p.x > o.maxX || p.y < o.minY || p.y > o.maxY) continue;
      if (o.forma === 'POLIGONO' && dentroDe(p, o.puntos)) return o.tipo;
      if (o.forma === 'PUNTO' && Math.hypot(p.x - o.puntos[0].x, p.y - o.puntos[0].y) <= o.radio) return o.tipo;
      if (o.forma === 'LINEA') {
        for (let i = 0; i + 1 < o.puntos.length; i++) {
          if (distanciaASegmento(p, o.puntos[i], o.puntos[i + 1]) <= o.radio) return o.tipo;
        }
      }
    }
    return null;
  };
}

export function resumirObjetos(poligono: PuntoGeo[], objetos: ObjetoTerreno[], resolucion = 60): ResumenObjetos {
  const proyeccion = ProyeccionLocal.para(poligono);
  const borde = poligono.map((p) => proyeccion.aLocal(p));
  const detector = crearDetector(objetos, proyeccion);
  const xs = borde.map((p) => p.x);
  const ys = borde.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const cuenta: Partial<Record<TipoObjeto, number>> = {};
  let interiores = 0;
  let ocupados = 0;
  for (let i = 0; i < resolucion; i++) {
    for (let j = 0; j < resolucion; j++) {
      const p = { x: minX + ((i + 0.5) * (maxX - minX)) / resolucion, y: minY + ((j + 0.5) * (maxY - minY)) / resolucion };
      if (!dentroDe(p, borde)) continue;
      interiores++;
      const tipo = detector(p);
      if (!tipo) continue;
      ocupados++;
      cuenta[tipo] = (cuenta[tipo] ?? 0) + 1;
    }
  }
  const porcentajes: Partial<Record<TipoObjeto, number>> = {};
  for (const [tipo, n] of Object.entries(cuenta) as [TipoObjeto, number][]) {
    porcentajes[tipo] = interiores ? Math.round((n * 1000) / interiores) / 10 : 0;
  }
  const conteo: Partial<Record<TipoObjeto, number>> = {};
  for (const o of objetos) conteo[o.tipo] = (conteo[o.tipo] ?? 0) + 1;
  return {
    porcentajes,
    porcentajeOcupado: interiores ? Math.round((ocupados * 1000) / interiores) / 10 : 0,
    conteo,
  };
}

export function quitarTramosEnObjetos(lineas: PuntoGeo[][], objetos: ObjetoTerreno[], pasoM = 1): PuntoGeo[][] {
  if (objetos.length === 0 || lineas.length === 0) return lineas;
  const proyeccion = new ProyeccionLocal(lineas[0][0]);
  const detector = crearDetector(objetos, proyeccion);
  const resultado: PuntoGeo[][] = [];
  for (const linea of lineas) {
    const a = proyeccion.aLocal(linea[0]);
    const b = proyeccion.aLocal(linea[linea.length - 1]);
    const largo = Math.hypot(b.x - a.x, b.y - a.y);
    if (largo === 0) continue;
    const pasos = Math.max(1, Math.ceil(largo / pasoM));
    const punto = (t: number) => proyeccion.aGeo({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    let inicio: number | null = null;
    for (let k = 0; k <= pasos; k++) {
      const t = k / pasos;
      const libre = !detector({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      if (libre && inicio === null) inicio = t;
      if ((!libre || k === pasos) && inicio !== null) {
        const fin = libre ? t : (k - 1) / pasos;
        if ((fin - inicio) * largo >= 1) resultado.push([punto(inicio), punto(fin)]);
        inicio = null;
      }
    }
  }
  return resultado;
}

export function recortarObjetosAlArea(objetos: ObjetoTerreno[], poligono: PuntoGeo[], pasoM = 1): ObjetoTerreno[] {
  if (poligono.length < 3) return objetos;
  const proyeccion = ProyeccionLocal.para(poligono);
  const borde = poligono.map((p) => proyeccion.aLocal(p));
  const adentro = (p: Xy) => dentroDe(p, borde);
  const resultado: ObjetoTerreno[] = [];

  for (const o of objetos) {
    const locales = o.puntos.map((p) => proyeccion.aLocal(p));
    if (o.forma === 'PUNTO') {
      if (adentro(locales[0])) resultado.push(o);
      continue;
    }
    if (o.forma === 'POLIGONO') {
      if (locales.some(adentro) || borde.some((b) => dentroDe(b, locales))) resultado.push(o);
      continue;
    }
    let tramo: Xy[] = [];
    const cerrarTramo = () => {
      if (tramo.length >= 2) resultado.push({ ...o, puntos: tramo.map((p) => proyeccion.aGeo(p)) });
      tramo = [];
    };
    for (let i = 0; i + 1 < locales.length; i++) {
      const a = locales[i];
      const b = locales[i + 1];
      const largo = Math.hypot(b.x - a.x, b.y - a.y);
      const pasos = Math.max(1, Math.ceil(largo / pasoM));
      for (let k = i === 0 ? 0 : 1; k <= pasos; k++) {
        const t = k / pasos;
        const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        if (adentro(p)) {
          if (tramo.length === 0 || k === pasos) tramo.push(p);
        } else if (tramo.length > 0) {
          const anterior = { x: a.x + (b.x - a.x) * ((k - 1) / pasos), y: a.y + (b.y - a.y) * ((k - 1) / pasos) };
          if (tramo[tramo.length - 1].x !== anterior.x || tramo[tramo.length - 1].y !== anterior.y) tramo.push(anterior);
          cerrarTramo();
        }
      }
    }
    cerrarTramo();
  }
  return resultado;
}
