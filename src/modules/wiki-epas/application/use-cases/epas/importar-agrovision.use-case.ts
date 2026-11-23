import { Inject, Injectable } from '@nestjs/common';
import { Epa } from '../../../domain/entities/epa.entity';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EPA_REPOSITORY_TOKEN } from '../../../domain/ports/epa.repository.token';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from '../../../domain/ports/tipo-cultivo-wiki.repository.token';
import type { CatalogoAgroVisionPort, FichaAgroVision } from '../../../domain/ports/catalogo-agrovision.port';
import { CATALOGO_AGROVISION_TOKEN } from '../../../domain/ports/catalogo-agrovision.port';

/** Etiqueta visible de las fichas traídas de AgroVisión. */
export const ETIQUETA_AGROVISION = 'AgroVisión';
/** Etiqueta técnica con la clave de la ficha: permite actualizarla en vez de duplicarla. */
export const PREFIJO_CLAVE_AGROVISION = 'agrovision:';

export interface ResumenImportacion {
  creadas: string[];
  actualizadas: string[];
  omitidas: { nombre: string; motivo: string }[];
  fuente: string;
}

const TIPOS: Record<string, 'ENFERMEDAD' | 'PLAGA'> = { enfermedad: 'ENFERMEDAD', plaga: 'PLAGA' };

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** "Roya de Café" y "Roya del cafeto" -> "roya": la primera palabra con sentido. */
const raiz = (nombre: string) => normalizar(nombre).split(/[\s(]+/)[0].replace(/s$/, '');

@Injectable()
export class ImportarAgroVisionUseCase {
  constructor(
    @Inject(CATALOGO_AGROVISION_TOKEN) private readonly catalogo: CatalogoAgroVisionPort,
    @Inject(EPA_REPOSITORY_TOKEN) private readonly epas: EpaRepositoryPort,
    @Inject(TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN) private readonly tiposCultivo: TipoCultivoWikiRepositoryPort,
  ) {}

  async execute(usuarioId: number): Promise<ResumenImportacion> {
    const fichas = await this.catalogo.listarFichas();
    const existentes = await this.epas.listarTodos();
    const cultivos = await this.tiposCultivo.listarTodos();
    const resumen: ResumenImportacion = {
      creadas: [],
      actualizadas: [],
      omitidas: [],
      fuente: 'AgroVisión — SENA, Análisis y Desarrollo de Software, ficha 3225853',
    };

    for (const ficha of fichas) {
      const tipoEpa = TIPOS[normalizar(ficha.tipo ?? '')];
      if (!tipoEpa) {
        resumen.omitidas.push({ nombre: ficha.nombreComun, motivo: `es ${ficha.tipo}, no una plaga ni una enfermedad` });
        continue;
      }

      const cultivo = cultivos.find((c) => normalizar(c.nombre) === normalizar(ficha.cultivo ?? 'cafe'));
      const etiquetaClave = PREFIJO_CLAVE_AGROVISION + ficha.clave;
      const datos = this.aDatos(ficha, tipoEpa, etiquetaClave);

      const importada = existentes.find((e) => e.etiquetas.includes(etiquetaClave));
      if (importada?.id) {
        importada.actualizarDatos(datos);
        if (cultivo) importada.cambiarCultivosSusceptibles([{ id: cultivo.id!, nombre: cultivo.nombre }]);
        await this.epas.actualizar(importada.id, importada);
        resumen.actualizadas.push(ficha.nombreComun);
        continue;
      }

      // Ya hay una ficha propia del mismo problema en ese cultivo: no se duplica
      const propia = existentes.find(
        (e) =>
          !e.etiquetas.some((t) => t.startsWith(PREFIJO_CLAVE_AGROVISION)) &&
          raiz(e.nombre) === raiz(ficha.nombreComun) &&
          (!cultivo || e.cultivosSusceptibles.some((c) => c.id === cultivo.id) || e.etiquetas.some((t) => normalizar(t) === normalizar(cultivo.nombre))),
      );
      if (propia) {
        resumen.omitidas.push({ nombre: ficha.nombreComun, motivo: `ya existe en la wiki como "${propia.nombre}"` });
        continue;
      }

      const epa = Epa.crear({
        ...datos,
        mesesProbables: [],
        temporadas: [],
        notasEstacionalidad: null,
        fotosGenerales: [],
        cultivosSusceptibles: cultivo ? [{ id: cultivo.id!, nombre: cultivo.nombre }] : [],
        creadoPorUsuarioId: usuarioId,
      });
      await this.epas.guardar(epa);
      resumen.creadas.push(ficha.nombreComun);
    }

    return resumen;
  }

  private aDatos(ficha: FichaAgroVision, tipoEpa: 'ENFERMEDAD' | 'PLAGA', etiquetaClave: string) {
    const manejo = [ficha.medidasContencion, ficha.protocoloQuimico].filter((t): t is string => !!t?.trim()).join('\n\n');
    return {
      nombre: ficha.nombreComun,
      tipoEpa,
      descripcion: [ficha.descripcion, ficha.nombreCientifico ? `Nombre científico: ${ficha.nombreCientifico}.` : null]
        .filter(Boolean)
        .join(' ') || ficha.nombreComun,
      sintomas: ficha.sintomas?.trim() || ficha.descripcion?.trim() || 'Sin dato en AgroVisión.',
      manejoYControl: manejo || 'AgroVisión todavía no publica el manejo de esta ficha. Consulta con tu instructor o un agrónomo.',
      fotosSintomas: ficha.fotoUrl ? [ficha.fotoUrl] : [],
      etiquetas: [ETIQUETA_AGROVISION, ficha.avalada ? 'Avalada por agrónomo' : 'Sin avalar', etiquetaClave],
    };
  }
}
