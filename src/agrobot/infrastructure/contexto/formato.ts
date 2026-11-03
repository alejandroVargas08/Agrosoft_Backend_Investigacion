export function formatoFecha(fecha: Date | null): string {
  return fecha ? fecha.toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : 'sin dato';
}

export function promedio(valores: number[]): number {
  return Math.round((valores.reduce((suma, v) => suma + v, 0) / valores.length) * 10) / 10;
}
