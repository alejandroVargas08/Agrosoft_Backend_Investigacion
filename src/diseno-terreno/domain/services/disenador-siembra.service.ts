import { CultivoAptitud } from '../entities/cultivo-aptitud.entity';
import { PuntoGeo, quitarTramosEnCirculos, trazarSurcos } from '../value-objects/geo';
import { quitarTramosEnObjetos } from '../value-objects/objetos-terreno';
import { PerfilTerreno, ZonaExcluida } from '../value-objects/perfil-terreno.vo';

export type SistemaTrazado = 'SURCOS_RECTOS' | 'CURVAS_DE_NIVEL' | 'CURVAS_CON_BARRERAS' | 'TERRAZAS' | 'NO_RECOMENDADO';

export interface DisenoSiembra {
  cultivoCodigo: string;
  cultivoNombre: string;
  areaTotalM2: number;
  areaSembrableM2: number;
  areaEfectivaM2: number;
  porcentajeCaminos: number;
  distanciaSurcosM: number;
  distanciaPlantasM: number;
  densidadPlantasHa: number;
  plantasEstimadas: number;
  surcosEstimados: number;
  longitudSurcosM: number;
  sistemaTrazado: SistemaTrazado;
  orientacionSurcosGrados: number;
  recomendaciones: string[];
  surcos: PuntoGeo[][];
  surcosPorLinea: number;
  zonasExcluidas: ZonaExcluida[];
  porcentajeYaSembrado: number;
}

const CAMINOS_PERENNES = 0.1;
const CAMINOS_TRANSITORIOS = 0.15;

export class DisenadorSiembra {
  static disenar(poligono: PuntoGeo[], perfil: PerfilTerreno, cultivo: CultivoAptitud): DisenoSiembra {
    const recomendaciones: string[] = [];
    const pendiente = perfil.topografia?.pendientePct ?? null;
    const azimut = perfil.topografia?.azimutBajadaGrados ?? null;

    const porcentajeYaSembrado = Math.round(perfil.cobertura?.porcentajes.CULTIVO ?? 0);
    const porcentajeSembrable = Math.max(0, (perfil.cobertura?.porcentajeSembrable ?? 100) - porcentajeYaSembrado);
    if (!perfil.cobertura) {
      recomendaciones.push('No se verificó qué hay sobre el terreno; se asumió el 100 % sembrable. Confírmalo con dron o imagen satelital.');
    }
    if (porcentajeYaSembrado > 0) {
      const cultivos = (perfil.cobertura?.cultivosExistentes ?? []).map((c) => c.nombre).join(', ');
      recomendaciones.push(
        `El ${porcentajeYaSembrado} % ya tiene cultivo${cultivos ? ` (${cultivos})` : ''}: el diseño solo usa el área libre. Si vas a renovar ese cultivo, el área disponible es mayor.`,
      );
    }
    const zonasExcluidas = (perfil.cobertura?.zonasExcluidas ?? []).filter((z) => z.tipo !== 'LIBRE');

    const porcentajeCaminos = cultivo.perenne ? CAMINOS_PERENNES : CAMINOS_TRANSITORIOS;
    const areaSembrableM2 = Math.round((perfil.areaM2 * porcentajeSembrable) / 100);
    const areaEfectivaM2 = Math.round(areaSembrableM2 * (1 - porcentajeCaminos));
    const marco = cultivo.distanciaSurcosM * cultivo.distanciaPlantasM;
    const densidadPlantasHa = Math.round(10_000 / marco);
    const plantasEstimadas = Math.floor(areaEfectivaM2 / marco);

    const sistemaTrazado = DisenadorSiembra.sistema(pendiente);
    const usarContorno = pendiente !== null && pendiente >= 3 && azimut !== null;
    const orientacionSurcosGrados = usarContorno ? ((azimut as number) + 90) % 180 : 0;

    recomendaciones.push(...DisenadorSiembra.recomendacionesTrazado(sistemaTrazado, pendiente));
    if (!usarContorno) recomendaciones.push('Orienta los surcos de norte a sur para repartir mejor la luz durante el día.');
    if (cultivo.notas) recomendaciones.push(cultivo.notas);

    const trazado = trazarSurcos(poligono, orientacionSurcosGrados, cultivo.distanciaSurcosM);
    const factorUtil = areaEfectivaM2 / Math.max(perfil.areaM2, 1);

    return {
      cultivoCodigo: cultivo.codigo,
      cultivoNombre: cultivo.nombre,
      areaTotalM2: Math.round(perfil.areaM2),
      areaSembrableM2,
      areaEfectivaM2,
      porcentajeCaminos: Math.round(porcentajeCaminos * 100),
      distanciaSurcosM: cultivo.distanciaSurcosM,
      distanciaPlantasM: cultivo.distanciaPlantasM,
      densidadPlantasHa,
      plantasEstimadas,
      surcosEstimados: Math.round(trazado.surcosReales * Math.min(1, factorUtil / (1 - porcentajeCaminos))),
      longitudSurcosM: Math.round(trazado.longitudTotalM * factorUtil),
      sistemaTrazado,
      orientacionSurcosGrados: Math.round(orientacionSurcosGrados),
      recomendaciones,
      surcos: quitarTramosEnObjetos(quitarTramosEnCirculos(trazado.lineas, zonasExcluidas), perfil.objetos ?? []),
      surcosPorLinea: trazado.surcosPorLinea,
      zonasExcluidas,
      porcentajeYaSembrado,
    };
  }

  private static sistema(pendiente: number | null): SistemaTrazado {
    if (pendiente === null || pendiente < 3) return 'SURCOS_RECTOS';
    if (pendiente < 12) return 'CURVAS_DE_NIVEL';
    if (pendiente < 25) return 'CURVAS_CON_BARRERAS';
    if (pendiente < 50) return 'TERRAZAS';
    return 'NO_RECOMENDADO';
  }

  private static recomendacionesTrazado(sistema: SistemaTrazado, pendiente: number | null): string[] {
    switch (sistema) {
      case 'SURCOS_RECTOS':
        return pendiente === null
          ? ['No se pudo medir la pendiente; se propone trazado recto.']
          : ['Terreno casi plano: surcos rectos. Revisa el drenaje para evitar encharcamientos.'];
      case 'CURVAS_DE_NIVEL':
        return ['Traza los surcos siguiendo las curvas de nivel (atravesados a la pendiente) para frenar la erosión.'];
      case 'CURVAS_CON_BARRERAS':
        return [
          'Surcos en curvas de nivel con barreras vivas (pasto vetiver o limoncillo) cada 10–15 m.',
          'Evita dejar el suelo desnudo en temporada de lluvias.',
        ];
      case 'TERRAZAS':
        return [
          'Pendiente fuerte: usa terrazas individuales o siembra a tresbolillo.',
          'Prefiere cultivos permanentes (café, frutales) sobre cultivos limpios.',
        ];
      case 'NO_RECOMENDADO':
        return ['Pendiente mayor al 50 %: no se recomiendan cultivos limpios; destina el área a conservación o sistemas agroforestales.'];
    }
  }
}
