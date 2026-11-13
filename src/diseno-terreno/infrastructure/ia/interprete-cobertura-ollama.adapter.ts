import { Inject, Injectable } from '@nestjs/common';
import type { IaProviderPort } from '../../../ia/domain/ports/ia-provider.port';
import { IA_PROVIDER_TOKEN } from '../../../ia/domain/ports/ia-provider.token';
import {
  TIPOS_COBERTURA_VISUAL,
  TipoCoberturaVisual,
} from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import { CoberturaInterpretada, InterpreteCoberturaPort } from '../../domain/ports/proveedores-geo.port';

const ESQUEMA = {
  type: 'object',
  properties: {
    coberturas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: [...TIPOS_COBERTURA_VISUAL] },
          porcentajeAproximado: { type: 'number' },
        },
        required: ['tipo', 'porcentajeAproximado'],
      },
    },
    observaciones: { type: 'array', items: { type: 'string' } },
  },
  required: ['coberturas', 'observaciones'],
};

const PROMPT = `Eres un agrónomo que interpreta imágenes satelitales en Colombia.
La imagen es una vista satelital cenital. El contorno ROJO delimita el terreno a evaluar: analiza SOLO lo que está dentro del contorno.
Estima qué porcentaje del interior ocupa cada tipo de cobertura:
- CULTIVO: plantas sembradas en hileras o parcelas.
- PASTO: potrero o pradera.
- BOSQUE: árboles densos o rastrojo alto (sembrar ahí exigiría talar).
- SUELO_DESNUDO: tierra sin vegetación, arada o en preparación.
- CONSTRUCCION: techos, casas, galpones, invernaderos, placas de cemento.
- VIA: carreteras, caminos o parqueaderos.
- AGUA: ríos, quebradas, lagos, reservorios.
- OTRO: lo que no encaje.
Los porcentajes deben sumar 100. Un techo o una placa de cemento NUNCA es sembrable aunque tenga color claro como el suelo.
En "observaciones" escribe frases cortas en español sobre lo relevante para sembrar: construcciones, árboles a talar, zonas encharcadas, erosión, sombra.
Si la imagen es borrosa o está cubierta de nubes, dilo en observaciones.`;

@Injectable()
export class InterpreteCoberturaOllamaAdapter implements InterpreteCoberturaPort {
  constructor(
    @Inject(IA_PROVIDER_TOKEN)
    private readonly iaProvider: IaProviderPort,
  ) {}

  async interpretarImagenSatelital(imagenBase64: string): Promise<CoberturaInterpretada> {
    const respuesta = (await this.iaProvider.generarEstructurado(PROMPT, ESQUEMA, [imagenBase64])) as {
      coberturas?: { tipo?: string; porcentajeAproximado?: number }[];
      observaciones?: unknown[];
    } | null;

    const acumulado: Partial<Record<TipoCoberturaVisual, number>> = {};
    for (const item of respuesta?.coberturas ?? []) {
      const tipo = item?.tipo as TipoCoberturaVisual;
      const valor = Number(item?.porcentajeAproximado);
      if (!TIPOS_COBERTURA_VISUAL.includes(tipo) || !Number.isFinite(valor) || valor <= 0) continue;
      acumulado[tipo] = (acumulado[tipo] ?? 0) + valor;
    }

    const total = Object.values(acumulado).reduce((a, b) => a + (b ?? 0), 0);
    if (total <= 0) throw new Error('La IA no pudo clasificar la cobertura del terreno');

    const porcentajes: Partial<Record<TipoCoberturaVisual, number>> = {};
    for (const [tipo, valor] of Object.entries(acumulado) as [TipoCoberturaVisual, number][]) {
      porcentajes[tipo] = Math.round((valor * 1000) / total) / 10;
    }

    const observaciones = (respuesta?.observaciones ?? [])
      .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
      .map((o) => o.trim().slice(0, 300))
      .slice(0, 8);

    return { porcentajes, observaciones };
  }
}
