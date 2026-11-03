import { Inject, Injectable } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { VueloRepositoryPort } from '../../../drones/domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../drones/domain/ports/vuelo.repository.token';
import type { AnalisisVueloRepositoryPort } from '../../../drones/domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../drones/domain/ports/analisis-vuelo.repository.token';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { CatalogoLotesService } from '../../application/services/catalogo-lotes.service';
import { formatoFecha } from './formato';

const MAX_VUELOS = 5;

@Injectable()
export class ProveedorContextoDrones implements ProveedorContextoPort {
  readonly fuente = 'drones' as const;

  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN) private readonly vuelos: VueloRepositoryPort,
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN) private readonly analisis: AnalisisVueloRepositoryPort,
    private readonly catalogoLotes: CatalogoLotesService,
  ) {}

  async obtener(usuario: UsuarioAutenticado): Promise<string> {
    const lotes = await this.catalogoLotes.visibles(usuario);
    const lista = await this.vuelos.listar({ loteIds: [...lotes.keys()] });
    if (lista.length === 0) return 'DRONES: no hay vuelos registrados en los lotes de este usuario.';

    const lineas = await Promise.all(
      lista.slice(0, MAX_VUELOS).map(async (vuelo) => {
        const v = vuelo.toJSON();
        const analisis = await this.analisis.listarPorVuelo(v.id as number);
        const completo = analisis.find((a) => a.estado === 'COMPLETADO' && a.resumen);
        const base =
          `- ${v.nombre} | ${formatoFecha(v.fechaVuelo)} | ${lotes.get(v.loteId) ?? `lote ${v.loteId}`}` +
          ` | estado ${v.estado} | capturas ${v.totalCapturas}`;

        if (!completo || !completo.resumen) return `${base} | sin análisis completado`;

        const r = completo.resumen;
        const d = r.distribucionNdvi;
        const indices = [
          r.ndvi ? `NDVI ${r.ndvi.promedio}` : null,
          r.ndre ? `NDRE ${r.ndre.promedio}` : null,
          r.gndvi ? `GNDVI ${r.gndvi.promedio}` : null,
        ]
          .filter(Boolean)
          .join(', ');
        const interpretacion = r.ia.sintesis?.resumen ?? 'sin interpretación de IA';

        return (
          `${base} | índices promedio: ${indices || 'sin datos'}` +
          ` | saludable ${d.SALUDABLE} %, estrés moderado ${d.ESTRES_MODERADO} %, estrés alto ${d.ESTRES_ALTO} %, sin vegetación ${d.SIN_VEGETACION} %` +
          ` | capturas críticas ${r.capturasCriticas} de ${r.capturasAnalizadas}` +
          ` | interpretación: ${interpretacion}`
        );
      }),
    );

    return ['DRONES (vuelos más recientes y su último análisis):', ...lineas].join('\n');
  }
}
