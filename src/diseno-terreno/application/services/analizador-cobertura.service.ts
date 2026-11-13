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
import { fraccionCubierta, PuntoGeo, zonaDeCapturas } from '../../domain/value-objects/geo';
import { CoberturaTerreno, CultivoExistente, porcentajeSembrable, TipoZona, ZonaExcluida } from '../../domain/value-objects/perfil-terreno.vo';

const ALTURA_VUELO_POR_DEFECTO_M = 60;
const FACTOR_HUELLA_CAMARA = 0.55;
const HALLAZGOS_RELEVANTES = ['MALEZA', 'ENCHARCAMIENTO', 'EROSION', 'POSIBLE_PLAGA_O_ENFERMEDAD'];

const GRUPOS_ZONA: [TipoZona, TipoCoberturaVisual[]][] = [
  ['NO_SEMBRABLE', ['CONSTRUCCION', 'VIA', 'AGUA']],
  ['BOSQUE', ['BOSQUE']],
  ['YA_SEMBRADO', ['CULTIVO']],
  ['LIBRE', ['PASTO', 'SUELO_DESNUDO']],
];

const ETIQUETAS: Record<TipoCoberturaVisual, string> = {
  CULTIVO: 'Cultivo',
  PASTO: 'Pasto',
  BOSQUE: 'Bosque o rastrojo',
  SUELO_DESNUDO: 'Suelo desnudo',
  CONSTRUCCION: 'Construcción',
  VIA: 'Vía o camino',
  AGUA: 'Agua',
  OTRO: 'Otro',
};

export interface AreaDeVuelo {
  loteId: number;
  nombre: string;
  poligono: PuntoGeo[];
}

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

  async desdeDron(loteId: number, vueloId: number | null, poligono: PuntoGeo[]): Promise<CoberturaTerreno | null> {
    const vuelos = (await this.vueloRepository.listar({ loteId }))
      .filter((v) => v.estado === 'ANALIZADO' && (!vueloId || v.id === vueloId))
      .sort((a, b) => new Date(b.fechaVuelo).getTime() - new Date(a.fechaVuelo).getTime());

    for (const vuelo of vuelos) {
      const analisis = (await this.analisisRepository.listarPorVuelo(vuelo.id as number)).find((a) => a.estado === 'COMPLETADO');
      if (!analisis) continue;
      const resultados = await this.resultadoRepository.listarPorAnalisis(analisis.id as number, false);
      const interpretados = resultados.filter((r) => r.interpretacionIa?.coberturas?.length);

      const acumulado: Partial<Record<TipoCoberturaVisual, number>> = {};
      const zonas: ZonaExcluida[] = [];
      const conteoCultivos = new Map<string, number>();
      const observaciones = new Set<string>();
      const radioM = this.radioHuella(vuelo.alturaVueloM);

      for (const resultado of interpretados) {
        const interpretacion = resultado.interpretacionIa!;
        for (const c of interpretacion.coberturas) {
          acumulado[c.tipo] = (acumulado[c.tipo] ?? 0) + c.porcentajeAproximado / interpretados.length;
        }
        const cultivos = [...new Set((interpretacion.cultivosVisibles ?? []).map((c) => c.trim().toLowerCase()).filter(Boolean))];
        for (const cultivo of cultivos) conteoCultivos.set(cultivo, (conteoCultivos.get(cultivo) ?? 0) + 1);
        const zona = this.clasificarCaptura(interpretacion.coberturas, cultivos);
        if (zona && resultado.ubicacion) {
          zonas.push({ centro: { lat: resultado.ubicacion.latitud, lng: resultado.ubicacion.longitud }, radioM, ...zona });
        }
        for (const h of interpretacion.hallazgos) {
          if (HALLAZGOS_RELEVANTES.includes(h.tipo)) observaciones.add(`${h.tipo.replace(/_/g, ' ').toLowerCase()}: ${h.descripcion}`);
        }
      }

      const cultivosExistentes: CultivoExistente[] = [...conteoCultivos.entries()]
        .sort((x, y) => y[1] - x[1])
        .map(([nombre, capturas]) => ({ nombre, capturas }));

      let porcentajes = this.redondear(acumulado);
      const resumenNdvi = analisis.resumen?.cobertura;
      if (interpretados.length === 0) {
        if (!resumenNdvi) continue;
        porcentajes = { AGUA: resumenNdvi.AGUA, SUELO_DESNUDO: resumenNdvi.SIN_VEGETACION, PASTO: resumenNdvi.VEGETACION };
        observaciones.add('Cobertura estimada solo con NDVI: no distingue suelo desnudo de techos o cemento. Activa la IA en el análisis del vuelo.');
      }
      for (const texto of analisis.resumen?.ia?.sintesis?.advertencias ?? []) observaciones.add(texto);

      const fuentesUbicadas = (interpretados.length > 0 ? interpretados : resultados).filter((r) => r.ubicacion);
      const centros = fuentesUbicadas.map((r) => ({ lat: r.ubicacion!.latitud, lng: r.ubicacion!.longitud }));
      const areaVerificadaPct = Math.round(fraccionCubierta(poligono, centros, radioM) * 100);

      return {
        fuente: 'DRON',
        porcentajes,
        porcentajeSembrable: porcentajeSembrable(porcentajes),
        areaVerificadaPct,
        observaciones: [...observaciones].slice(0, 10),
        zonas,
        zonasExcluidas: zonas.filter((z) => z.tipo !== 'LIBRE'),
        cultivosExistentes,
        fecha: vuelo.fechaVuelo,
        referencia: `Vuelo "${vuelo.nombre}" (#${vuelo.id}), análisis #${analisis.id}`,
      };
    }
    return null;
  }

  async areaDelVuelo(vueloId: number, limite: PuntoGeo[] | null): Promise<AreaDeVuelo | null> {
    const vuelo = await this.vueloRepository.buscarPorId(vueloId);
    if (!vuelo) return null;
    const analisis = (await this.analisisRepository.listarPorVuelo(vueloId)).find((a) => a.estado === 'COMPLETADO');
    if (!analisis) return null;
    const resultados = await this.resultadoRepository.listarPorAnalisis(analisis.id as number, false);
    const centros = resultados.filter((r) => r.ubicacion).map((r) => ({ lat: r.ubicacion!.latitud, lng: r.ubicacion!.longitud }));
    if (centros.length === 0) return null;
    const poligono = zonaDeCapturas(centros, this.radioHuella(vuelo.alturaVueloM), limite);
    if (poligono.length < 3) return null;
    return { loteId: vuelo.loteId, nombre: vuelo.nombre, poligono };
  }

  async desdeSatelite(poligono: PuntoGeo[]): Promise<CoberturaTerreno> {
    const imagen = await this.imagenSatelital.obtenerImagen(poligono).catch((error: unknown) => {
      throw new Error(`falló la descarga de la imagen satelital (${this.mensaje(error)})`);
    });
    const { porcentajes, observaciones } = await this.interprete.interpretarImagenSatelital(imagen.base64).catch((error: unknown) => {
      throw new Error(`falló la IA al analizar la imagen satelital (${this.mensaje(error)})`);
    });
    return {
      fuente: 'SATELITE',
      porcentajes,
      porcentajeSembrable: porcentajeSembrable(porcentajes),
      areaVerificadaPct: 100,
      observaciones: [
        ...observaciones,
        'Imagen satelital de fecha desconocida (puede tener meses o años). Verifica en campo antes de sembrar.',
      ],
      zonas: [],
      zonasExcluidas: [],
      cultivosExistentes: [],
      fecha: null,
      referencia: imagen.fuente,
    };
  }

  combinar(dron: CoberturaTerreno, satelite: CoberturaTerreno): CoberturaTerreno {
    const peso = dron.areaVerificadaPct / 100;
    const tipos = new Set([...Object.keys(dron.porcentajes), ...Object.keys(satelite.porcentajes)]) as Set<TipoCoberturaVisual>;
    const mezcla: Partial<Record<TipoCoberturaVisual, number>> = {};
    for (const tipo of tipos) {
      mezcla[tipo] = (dron.porcentajes[tipo] ?? 0) * peso + (satelite.porcentajes[tipo] ?? 0) * (1 - peso);
    }
    const porcentajes = this.redondear(mezcla);
    return {
      fuente: 'DRON_Y_SATELITE',
      porcentajes,
      porcentajeSembrable: porcentajeSembrable(porcentajes),
      areaVerificadaPct: 100,
      observaciones: [...dron.observaciones, ...satelite.observaciones].slice(0, 12),
      zonas: dron.zonas,
      zonasExcluidas: dron.zonasExcluidas,
      cultivosExistentes: dron.cultivosExistentes,
      fecha: dron.fecha,
      referencia: `${dron.referencia} (${dron.areaVerificadaPct} % del terreno) + ${satelite.referencia ?? 'imagen satelital'}`,
    };
  }

  completarSinVerificar(dron: CoberturaTerreno): CoberturaTerreno {
    const peso = dron.areaVerificadaPct / 100;
    const escalados: Partial<Record<TipoCoberturaVisual, number>> = {};
    for (const [tipo, valor] of Object.entries(dron.porcentajes) as [TipoCoberturaVisual, number][]) {
      escalados[tipo] = valor * peso;
    }
    return {
      ...dron,
      porcentajes: this.redondear(escalados),
      porcentajeSembrable: Math.round(dron.porcentajeSembrable * peso + 100 * (1 - peso)),
    };
  }

  private radioHuella(alturaVueloM: number | null): number {
    return Math.round((alturaVueloM ?? ALTURA_VUELO_POR_DEFECTO_M) * FACTOR_HUELLA_CAMARA);
  }

  private clasificarCaptura(
    coberturas: { tipo: TipoCoberturaVisual; porcentajeAproximado: number; descripcion: string }[],
    cultivos: string[],
  ): { tipo: TipoZona; motivo: string } | null {
    let mejor: { tipo: TipoZona; total: number; dominante: (typeof coberturas)[number] | null } | null = null;
    for (const [tipo, tipos] of GRUPOS_ZONA) {
      const delGrupo = coberturas.filter((c) => tipos.includes(c.tipo));
      const total = delGrupo.reduce((suma, c) => suma + c.porcentajeAproximado, 0);
      if (total > 0 && (!mejor || total > mejor.total)) {
        const dominante = [...delGrupo].sort((x, y) => y.porcentajeAproximado - x.porcentajeAproximado)[0] ?? null;
        mejor = { tipo, total, dominante };
      }
    }
    if (!mejor) return null;
    const detalle = mejor.dominante?.descripcion?.trim();
    const etiqueta = mejor.dominante ? ETIQUETAS[mejor.dominante.tipo] : '';
    switch (mejor.tipo) {
      case 'NO_SEMBRABLE':
        return { tipo: mejor.tipo, motivo: detalle ? `${etiqueta}: ${detalle}` : etiqueta };
      case 'BOSQUE':
        return { tipo: mejor.tipo, motivo: 'Bosque o rastrojo: talar requiere permiso de la corporación autónoma regional' };
      case 'YA_SEMBRADO':
        return { tipo: mejor.tipo, motivo: cultivos.length ? `Ya sembrado con ${cultivos.join(', ')}` : detalle ? `Ya sembrado: ${detalle}` : 'Ya sembrado' };
      case 'LIBRE':
        return { tipo: mejor.tipo, motivo: `Libre para sembrar (${etiqueta.toLowerCase()})` };
    }
  }

  private mensaje(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private redondear(valores: Partial<Record<TipoCoberturaVisual, number>>): Partial<Record<TipoCoberturaVisual, number>> {
    const resultado: Partial<Record<TipoCoberturaVisual, number>> = {};
    for (const [tipo, valor] of Object.entries(valores) as [TipoCoberturaVisual, number][]) {
      resultado[tipo] = Math.round(valor * 10) / 10;
    }
    return resultado;
  }
}
