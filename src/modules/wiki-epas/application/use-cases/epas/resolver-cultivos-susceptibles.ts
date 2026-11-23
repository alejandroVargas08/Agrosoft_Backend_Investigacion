import { NotFoundException } from '@nestjs/common';
import type { CultivoSusceptible } from '../../../domain/entities/epa.entity';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';

/** Convierte los ids que manda el formulario en cultivos de la wiki que existen. */
export async function resolverCultivosSusceptibles(
  ids: number[],
  repositorio: TipoCultivoWikiRepositoryPort,
): Promise<CultivoSusceptible[]> {
  const unicos = [...new Set(ids)];
  const cultivos: CultivoSusceptible[] = [];
  for (const id of unicos) {
    const tipo = await repositorio.buscarPorId(id);
    if (!tipo) throw new NotFoundException(`No existe el tipo de cultivo de la wiki con id ${id}`);
    cultivos.push({ id: tipo.id as number, nombre: tipo.nombre });
  }
  return cultivos;
}
