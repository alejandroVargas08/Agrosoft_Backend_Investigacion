import { Injectable } from '@nestjs/common';
import { ListarEpasUseCase } from '../../../modules/wiki-epas/application/use-cases/epas/listar-epas.use-case';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Las fichas traídas de AgroVisión se citan; si no están avaladas son solo información de apoyo.
const fuente = (etiquetas: string[]) =>
  !etiquetas.includes('AgroVisión')
    ? ''
    : etiquetas.includes('Sin avalar')
      ? ' [fuente: AgroVisión — SENA; no revisada por un agrónomo, úsala solo como apoyo]'
      : ' [fuente: AgroVisión — SENA]';

// Le da a AgroBot las fichas de la Wiki EPA (plagas, enfermedades y arvenses)
// para que responda con lo que el centro ya documentó, no de memoria.
@Injectable()
export class ProveedorContextoPlagas implements ProveedorContextoPort {
  readonly fuente = 'plagas' as const;

  constructor(private readonly listarEpas: ListarEpasUseCase) {}

  async obtener(): Promise<string> {
    const epas = await this.listarEpas.execute();
    if (epas.length === 0) return 'WIKI EPA: no hay fichas registradas.';

    const fichas = epas.map((e) => {
      const meses = e.mesesProbables.length ? e.mesesProbables.map((m) => MESES[m - 1]).join(', ') : 'sin dato';
      return [
        `- ${e.nombre} (${e.tipoEpa.toLowerCase()}; cultivos susceptibles: ${e.cultivosSusceptibles.map((c) => c.nombre).join(', ') || e.etiquetas.filter((t) => !t.startsWith('agrovision:')).join(', ') || 'sin dato'})${fuente(e.etiquetas)}`,
        `  Síntomas: ${e.sintomas}`,
        `  Manejo y control: ${e.manejoYControl}`,
        `  Meses de mayor riesgo: ${meses}`,
      ].join('\n');
    });
    return ['WIKI EPA (fichas de plagas, enfermedades y arvenses del centro):', ...fichas].join('\n');
  }
}
