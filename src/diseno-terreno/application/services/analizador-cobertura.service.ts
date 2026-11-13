import { Inject, Injectable } from '@nestjs/common';
import type { AnalisisVueloRepositoryPort } from '../../../drones/domain/ports/analisis-vuelo.repository.port';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from '../../../drones/domain/ports/analisis-vuelo.repository.token';
import type { ResultadoCapturaRepositoryPort } from '../../../drones/domain/ports/resultado-captura.repository.port';
import { RESULTADO_CAPTURA_REPOSITORY_TOKEN } from '../../../drones/domain/ports/resultado-captura.repository.token';
import type { VueloRepositoryPort } from '../../../drones/domain/ports/vuelo.repository.port';
import { VUELO_REPOSITORY_TOKEN } from '../../../drones/domain/ports/vuelo.repository.token';
import type { TipoCoberturaVisual } from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import type { InterpreteCoberturaPort, ProveedorImagenSatelitalPort } from '../../domain/ports/proveedores-geo.port';
import { INTERPRETE_COBERTURA_TOKEN, PROVEEDOR_IMAGEN_SATELITAL_TOKEN } from '../../domain/ports/proveedores-geo.port';
import { PuntoGeo } from '../../domain/value-objects/geo';
import { CoberturaTerreno, porcentajeSembrable, ZonaExcluida } from '../../domain/value-objects/perfil-terreno.vo';

const NO_SEMBRABLES: TipoCoberturaVisual[] = ['CONSTRUCCION', 'VIA', 'AGUA'];
const UMBRAL_ZONA_EXCLUIDA = 50;
const ALTURA_VUELO_POR_DEFECTO_M = 60;
const FACTOR_HUELLA_CAMARA = 0.55;
const HALLAZGOS_RELEVANTES = ['MALEZA', 'ENCHARCAMIENTO', 'EROSION', 'POSIBLE_PLAGA_O_ENFERMEDAD'];

@Injectable()
export class AnalizadorCoberturaService {
  constructor(
    @Inject(VUELO_REPOSITORY_TOKEN)
    private readonly vueloRepository: VueloRepositoryPort,
    @Inject(ANALISIS_VUELO_REPOSITORY_TOKEN)
    private readonly analisisRepository: AnalisisVueloRepositoryPort,
    @Inject(RESULTADO_CAPTURA_REPOSITORY_TOKEN)
    private readonly resultadoRepository: ResultadoCapturaRepositoryPort,
    @Inject(PROVEEDOR_IMAGEN_SATELITAL_TOKEN)
    private readonly imagenSatelital: ProveedorImagenSatelitalPort,
    @Inject(INTERPRETE_COBERTURA_TOKEN)
    private readonly interprete: InterpreteCoberturaPort,
  ) {}

  satelitalDisponible(): boolean {
    return this.imagenSatelital.disponible();
  }

  async desdeDron(loteId: number): Promise<CoberturaTerreno | null> {
    const vuelos = (await this.vueloRepository.listar({ loteId }))
      .filter((v) => v.estado === 'ANALIZADO')
      .sort((a, b) => new Date(b.fechaVuelo).getTime() - new Date(a.fechaVuelo).getTime());

    for (const vuelo of vuelos) {
      const analisis = (await this.analisisRepository.listarPorVuelo(vuelo.id as number)).find((a) => a.estado === 'COMPLETADO');
      if (!analisis) continue;
      const resultados = await this.resultadoRepository.listarPorAnalisis(analisis.id as number, false);
      const interpretados = resultados.filter((r) => r.interpretacionIa?.coberturas?.length);

      const acumulado: Partial<Record<TipoCoberturaVisual, number>> = {};
      const zonasExcluidas: ZonaExcluida[] = [];
      const observaciones = new Set<string>();
      const radioM = Math.round((vuelo.alturaVueloM ?? ALTURA_VUELO_POR_DEFECTO_M) * FACTOR_HUELLA_CAMARA);

      for (const resultado of interpretados) {
        const interpretacion = resultado.interpretacionIa!;
        let noSembrable = 0;
        for (const c of interpretacion.coberturas) {
          acumulado[c.tipo] = (acumulado[c.tipo] ?? 0) + c.porcentajeAproximado / interpretados.length;
          if (NO_SEMBRABLES.includes(c.tipo)) noSembrable += c.porcentajeAproximado;
        }
        if (noSembrable >= UMBRAL_ZONA_EXCLUIDA && resultado.ubicacion) {
          const dominante = [...interpretacion.coberturas].sort((a, b) => b.porcentajeAproximado - a.porcentajeAproximado)[0];
          zonasExcluidas.push({
            centro: { lat: resultado.ubicacion.latitud, lng: resultado.ubicacion.longitud },
            radioM,
            motivo: dominante?.descripcion || dominante?.tipo || 'Zona no sembrable',
          });
        }
        for (const h of interpretacion.hallazgos) {
          if (HALLAZGOS_RELEVANTES.includes(h.tipo)) observaciones.add(`${h.tipo.replace(/_/g, ' ').toLowerCase()}: ${h.descripcion}`);
        }
      }

      let porcentajes = this.redondear(acumulado);
      const resumenNdvi = analisis.resumen?.cobertura;
      if (interpretados.length === 0) {
        if (!resumenNdvi) continue;
        porcentajes = { AGUA: resumenNdvi.AGUA, SUELO_DESNUDO: resumenNdvi.SIN_VEGETACION, PASTO: resumenNdvi.VEGETACION };
        observaciones.add('Cobertura estimada solo con NDVI: no distingue suelo desnudo de techos o cemento. Activa la IA en el análisis del vuelo.');
      }
      for (const texto of analisis.resumen?.ia?.sintesis?.advertencias ?? []) observaciones.add(texto);

      return {
        fuente: 'DRON',
        porcentajes,
        porcentajeSembrable: porcentajeSembrable(porcentajes),
        observaciones: [...observaciones].slice(0, 10),
        zonasExcluidas,
        fecha: vuelo.fechaVuelo,
        referencia: `Vuelo "${vuelo.nombre}" (#${vuelo.id}), análisis #${analisis.id}`,
      };
    }
    return null;
  }

  async desdeSatelite(poligono: PuntoGeo[]): Promise<CoberturaTerreno> {
    const imagen = await this.imagenSatelital.obtenerImagen(poligono);
    const { porcentajes, observaciones } = await this.interprete.interpretarImagenSatelital(imagen.base64);
    return {
      fuente: 'SATELITE',
      porcentajes,
      porcentajeSembrable: porcentajeSembrable(porcentajes),
      observaciones: [
        ...observaciones,
        'Imagen satelital de fecha desconocida (puede tener meses o años). Verifica en campo antes de sembrar.',
      ],
      zonasExcluidas: [],
      fecha: null,
      referencia: imagen.fuente,
    };
  }

  private redondear(valores: Partial<Record<TipoCoberturaVisual, number>>): Partial<Record<TipoCoberturaVisual, number>> {
    const resultado: Partial<Record<TipoCoberturaVisual, number>> = {};
    for (const [tipo, valor] of Object.entries(valores) as [TipoCoberturaVisual, number][]) {
      resultado[tipo] = Math.round(valor * 10) / 10;
    }
    return resultado;
  }
}
