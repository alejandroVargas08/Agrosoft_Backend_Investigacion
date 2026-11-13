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
