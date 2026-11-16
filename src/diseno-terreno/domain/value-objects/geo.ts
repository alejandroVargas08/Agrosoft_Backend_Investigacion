export interface PuntoGeo {
  lat: number;
  lng: number;
}

interface PuntoLocal {
  x: number;
  y: number;
}

const METROS_POR_GRADO_LAT = 110_540;
const METROS_POR_GRADO_LNG = 111_320;

export class ProyeccionLocal {
  private readonly cosLat: number;

  constructor(private readonly origen: PuntoGeo) {
    this.cosLat = Math.cos((origen.lat * Math.PI) / 180);
  }

  static para(poligono: PuntoGeo[]): ProyeccionLocal {
    return new ProyeccionLocal(centroide(poligono));
  }

  aLocal(p: PuntoGeo): PuntoLocal {
    return {
      x: (p.lng - this.origen.lng) * METROS_POR_GRADO_LNG * this.cosLat,
      y: (p.lat - this.origen.lat) * METROS_POR_GRADO_LAT,
    };
  }

  aGeo(p: PuntoLocal): PuntoGeo {
    return {
      lat: redondear6(this.origen.lat + p.y / METROS_POR_GRADO_LAT),
      lng: redondear6(this.origen.lng + p.x / (METROS_POR_GRADO_LNG * this.cosLat)),
    };
  }
}

function redondear6(valor: number): number {
  return Math.round(valor * 1e6) / 1e6;
}

export function centroide(poligono: PuntoGeo[]): PuntoGeo {
  const suma = poligono.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
  return { lat: suma.lat / poligono.length, lng: suma.lng / poligono.length };
}

export function areaPoligonoM2(poligono: PuntoGeo[]): number {
  const proyeccion = ProyeccionLocal.para(poligono);
  const locales = poligono.map((p) => proyeccion.aLocal(p));
  let doble = 0;
  for (let i = 0; i < locales.length; i++) {
    const a = locales[i];
    const b = locales[(i + 1) % locales.length];
    doble += a.x * b.y - b.x * a.y;
  }
  return Math.abs(doble) / 2;
}

function dentro(p: PuntoLocal, poligono: PuntoLocal[]): boolean {
  let resultado = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const a = poligono[i];
    const b = poligono[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      resultado = !resultado;
    }
  }
  return resultado;
}

export function fraccionCubierta(poligono: PuntoGeo[], centros: PuntoGeo[], radioM: number, resolucion = 40): number {
  if (centros.length === 0 || radioM <= 0) return 0;
  const proyeccion = ProyeccionLocal.para(poligono);
  const locales = poligono.map((p) => proyeccion.aLocal(p));
  const circulos = centros.map((c) => proyeccion.aLocal(c));
  const xs = locales.map((p) => p.x);
  const ys = locales.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const radio2 = radioM * radioM;
  let interiores = 0;
  let cubiertos = 0;
  for (let i = 0; i < resolucion; i++) {
    for (let j = 0; j < resolucion; j++) {
      const p = { x: minX + ((i + 0.5) * (maxX - minX)) / resolucion, y: minY + ((j + 0.5) * (maxY - minY)) / resolucion };
      if (!dentro(p, locales)) continue;
      interiores++;
      if (circulos.some((c) => (c.x - p.x) ** 2 + (c.y - p.y) ** 2 <= radio2)) cubiertos++;
    }
  }
  return interiores === 0 ? 0 : cubiertos / interiores;
}

function areaFirmada(puntos: PuntoLocal[]): number {
  let doble = 0;
  for (let i = 0; i < puntos.length; i++) {
    const a = puntos[i];
    const b = puntos[(i + 1) % puntos.length];
    doble += a.x * b.y - b.x * a.y;
  }
  return doble / 2;
}

function envolventeConvexa(puntos: PuntoLocal[]): PuntoLocal[] {
  const ordenados = [...puntos].sort((a, b) => a.x - b.x || a.y - b.y);
  if (ordenados.length < 3) return ordenados;
  const cruz = (o: PuntoLocal, a: PuntoLocal, b: PuntoLocal) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const inferior: PuntoLocal[] = [];
  for (const p of ordenados) {
    while (inferior.length >= 2 && cruz(inferior[inferior.length - 2], inferior[inferior.length - 1], p) <= 0) inferior.pop();
    inferior.push(p);
  }
  const superior: PuntoLocal[] = [];
  for (const p of [...ordenados].reverse()) {
    while (superior.length >= 2 && cruz(superior[superior.length - 2], superior[superior.length - 1], p) <= 0) superior.pop();
    superior.push(p);
  }
  return [...inferior.slice(0, -1), ...superior.slice(0, -1)];
}

function recortarConConvexo(sujeto: PuntoLocal[], recorte: PuntoLocal[]): PuntoLocal[] {
  const lado = (a: PuntoLocal, b: PuntoLocal, p: PuntoLocal) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const corte = (p: PuntoLocal, q: PuntoLocal, a: PuntoLocal, b: PuntoLocal): PuntoLocal => {
    const lp = lado(a, b, p);
    const lq = lado(a, b, q);
    const t = lp / (lp - lq);
    return { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) };
  };
  let salida = areaFirmada(sujeto) < 0 ? [...sujeto].reverse() : [...sujeto];
  for (let i = 0; i < recorte.length && salida.length > 0; i++) {
    const a = recorte[i];
    const b = recorte[(i + 1) % recorte.length];
    const entrada = salida;
    salida = [];
    for (let j = 0; j < entrada.length; j++) {
      const actual = entrada[j];
      const previo = entrada[(j + entrada.length - 1) % entrada.length];
      const actualDentro = lado(a, b, actual) >= 0;
      const previoDentro = lado(a, b, previo) >= 0;
      if (actualDentro) {
        if (!previoDentro) salida.push(corte(previo, actual, a, b));
        salida.push(actual);
      } else if (previoDentro) {
        salida.push(corte(previo, actual, a, b));
      }
    }
  }
  return salida;
}

export function zonaDeCapturas(centros: PuntoGeo[], radioM: number, limite: PuntoGeo[] | null, lados = 16): PuntoGeo[] {
  if (centros.length === 0) return [];
  const proyeccion = ProyeccionLocal.para(centros);
  const bordes: PuntoLocal[] = [];
  for (const centro of centros) {
    const c = proyeccion.aLocal(centro);
    for (let k = 0; k < lados; k++) {
      const angulo = (2 * Math.PI * k) / lados;
      bordes.push({ x: c.x + radioM * Math.cos(angulo), y: c.y + radioM * Math.sin(angulo) });
    }
  }
  const envolvente = envolventeConvexa(bordes);
  if (limite && limite.length >= 3) {
    const recortado = recortarConConvexo(limite.map((p) => proyeccion.aLocal(p)), envolvente);
    if (recortado.length >= 3 && Math.abs(areaFirmada(recortado)) >= 1) return recortado.map((p) => proyeccion.aGeo(p));
  }
  return envolvente.map((p) => proyeccion.aGeo(p));
}

export interface CirculoGeo {
  centro: PuntoGeo;
  radioM: number;
}

export function quitarTramosEnCirculos(lineas: PuntoGeo[][], circulos: CirculoGeo[]): PuntoGeo[][] {
  if (circulos.length === 0 || lineas.length === 0) return lineas;
  const proyeccion = new ProyeccionLocal(lineas[0][0]);
  const locales = circulos.map((c) => ({ ...proyeccion.aLocal(c.centro), r: c.radioM }));
  const resultado: PuntoGeo[][] = [];
  for (const linea of lineas) {
    const a = proyeccion.aLocal(linea[0]);
    const b = proyeccion.aLocal(linea[linea.length - 1]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const largo2 = dx * dx + dy * dy;
    if (largo2 === 0) continue;
    const quitados: [number, number][] = [];
    for (const c of locales) {
      const t = ((c.x - a.x) * dx + (c.y - a.y) * dy) / largo2;
      const px = a.x + t * dx - c.x;
      const py = a.y + t * dy - c.y;
      const d2 = px * px + py * py;
      if (d2 >= c.r * c.r) continue;
      const mitad = Math.sqrt((c.r * c.r - d2) / largo2);
      quitados.push([t - mitad, t + mitad]);
    }
    quitados.sort((x, y) => x[0] - y[0]);
    let inicio = 0;
    const punto = (t: number) => proyeccion.aGeo({ x: a.x + t * dx, y: a.y + t * dy });
    for (const [desde, hasta] of quitados) {
      if (desde > inicio) resultado.push([punto(inicio), punto(Math.min(desde, 1))]);
      inicio = Math.max(inicio, hasta);
      if (inicio >= 1) break;
    }
    if (inicio < 1) resultado.push([punto(inicio), punto(1)]);
  }
  return resultado;
}

export function muestrearPuntos(poligono: PuntoGeo[], maximoInteriores = 36): PuntoGeo[] {
  const proyeccion = ProyeccionLocal.para(poligono);
  const locales = poligono.map((p) => proyeccion.aLocal(p));
  const xs = locales.map((p) => p.x);
  const ys = locales.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const lado = Math.ceil(Math.sqrt(maximoInteriores * 1.6));
  const interiores: PuntoGeo[] = [];
  for (let i = 0; i < lado; i++) {
    for (let j = 0; j < lado; j++) {
      const p = { x: minX + ((i + 0.5) * (maxX - minX)) / lado, y: minY + ((j + 0.5) * (maxY - minY)) / lado };
      if (dentro(p, locales)) interiores.push(proyeccion.aGeo(p));
    }
  }
  const paso = Math.max(1, Math.ceil(interiores.length / maximoInteriores));
  return [...poligono, ...interiores.filter((_, i) => i % paso === 0), centroide(poligono)];
}

export interface PlanoAjustado {
  pendientePct: number;
  azimutBajadaGrados: number | null;
}

export function ajustarPlano(puntos: PuntoGeo[], elevaciones: number[]): PlanoAjustado {
  const proyeccion = ProyeccionLocal.para(puntos);
  let sxx = 0, sxy = 0, syy = 0, sx = 0, sy = 0, sz = 0, sxz = 0, syz = 0;
  const n = puntos.length;
  puntos.forEach((punto, i) => {
    const { x, y } = proyeccion.aLocal(punto);
    const z = elevaciones[i];
    sxx += x * x; sxy += x * y; syy += y * y;
    sx += x; sy += y; sz += z;
    sxz += x * z; syz += y * z;
  });
  const m = [
    [sxx, sxy, sx],
    [sxy, syy, sy],
    [sx, sy, n],
  ];
  const det = determinante(m);
  if (Math.abs(det) < 1e-9) return { pendientePct: 0, azimutBajadaGrados: null };
  const a = determinante([[sxz, sxy, sx], [syz, syy, sy], [sz, sy, n]]) / det;
  const b = determinante([[sxx, sxz, sx], [sxy, syz, sy], [sx, sz, n]]) / det;
  const pendientePct = Math.round(Math.sqrt(a * a + b * b) * 1000) / 10;
  const azimut = ((Math.atan2(-a, -b) * 180) / Math.PI + 360) % 360;
  return { pendientePct, azimutBajadaGrados: pendientePct > 0 ? Math.round(azimut) : null };
}

function determinante(m: number[][]): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

export interface TrazadoSurcos {
  lineas: PuntoGeo[][];
  surcosReales: number;
  surcosPorLinea: number;
  longitudTotalM: number;
}

export function trazarSurcos(
  poligono: PuntoGeo[],
  orientacionGrados: number,
  separacionM: number,
  maximoLineas = 150,
): TrazadoSurcos {
  const proyeccion = ProyeccionLocal.para(poligono);
  const locales = poligono.map((p) => proyeccion.aLocal(p));
  const rad = (orientacionGrados * Math.PI) / 180;
  const d = { x: Math.sin(rad), y: Math.cos(rad) };
  const normal = { x: Math.cos(rad), y: -Math.sin(rad) };
  const proyectar = (p: PuntoLocal, v: PuntoLocal) => p.x * v.x + p.y * v.y;
  const offsets = locales.map((p) => proyectar(p, normal));
  const [minS, maxS] = [Math.min(...offsets), Math.max(...offsets)];
  const surcosReales = Math.max(0, Math.floor((maxS - minS) / separacionM));
  const surcosPorLinea = Math.max(1, Math.ceil(surcosReales / maximoLineas));
  const lineas: PuntoGeo[][] = [];
  let longitudTotalM = 0;

  for (let k = 0; k < surcosReales; k++) {
    const s = minS + (k + 0.5) * separacionM;
    const cortes: number[] = [];
    for (let i = 0; i < locales.length; i++) {
      const p1 = locales[i];
      const p2 = locales[(i + 1) % locales.length];
      const s1 = proyectar(p1, normal);
      const s2 = proyectar(p2, normal);
      if ((s1 - s) * (s2 - s) < 0) {
        const t = (s - s1) / (s2 - s1);
        cortes.push(proyectar({ x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) }, d));
      }
    }
    cortes.sort((a, b) => a - b);
    for (let c = 0; c + 1 < cortes.length; c += 2) {
      longitudTotalM += cortes[c + 1] - cortes[c];
      if (k % surcosPorLinea !== 0) continue;
      const punto = (u: number) => proyeccion.aGeo({ x: normal.x * s + d.x * u, y: normal.y * s + d.y * u });
      lineas.push([punto(cortes[c]), punto(cortes[c + 1])]);
    }
  }
  return { lineas, surcosReales, surcosPorLinea, longitudTotalM: Math.round(longitudTotalM) };
}
