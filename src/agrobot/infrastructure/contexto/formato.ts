export function formatoFecha(fecha: Date | null): string {
  return fecha ? fecha.toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : 'sin dato';
}

export function formatoDia(fecha: Date | string | null): string {
  if (!fecha) return 'sin fecha';
  const valor = typeof fecha === 'string' ? new Date(`${fecha.slice(0, 10)}T12:00:00`) : fecha;
  return valor.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'short', year: 'numeric' });
}

export function promedio(valores: number[]): number {
  return Math.round((valores.reduce((suma, v) => suma + v, 0) / valores.length) * 10) / 10;
}

export function pesos(valor: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

export function numero(valor: number | string | null): string {
  if (valor === null || valor === undefined) return 'sin dato';
  const n = Number(valor);
  return Number.isFinite(n) ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(n) : String(valor);
}

export function visibleLote(alias: string, indiceVerTodo: number, indiceProgramas: number): string {
  return `($${indiceVerTodo}::boolean OR ${alias}.programa_formacion_id IS NULL OR ${alias}.programa_formacion_id = ANY($${indiceProgramas}::int[]))`;
}
