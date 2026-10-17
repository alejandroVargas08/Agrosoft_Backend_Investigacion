export const TIPOS_COBERTURA_VISUAL = [ 'CULTIVO', 'PASTO', 'BOSQUE', 'SUELO_DESNUDO', 'CONSTRUCCION', 'VIA', 'AGUA', 'OTRO' ] as const;

export const TIPOS_HALLAZGO = [ 'ESTRES_VEGETAL', 'AMARILLAMIENTO', 'ZONA_SECA', 'MALEZA', 'ENCHARCAMIENTO', 'EROSION', 'FALLA_SIEMBRA', 'POSIBLE_PLAGA_O_ENFERMEDAD', 'OTRO' ] as const;

export const NIVELES = ['BAJA', 'MEDIA', 'ALTA'] as const;

export type TipoCoberturaVisual = (typeof TIPOS_COBERTURA_VISUAL)[number];
export type TipoHallazgo = (typeof TIPOS_HALLAZGO)[number];
export type Nivel = (typeof NIVELES)[number];

export interface CoberturaVisual {
  tipo: TipoCoberturaVisual;
  porcentajeAproximado: number;
  descripcion: string;
}

export interface HallazgoVisual {
  tipo: TipoHallazgo;
  severidad: Nivel;
  ubicacionEnImagen: string;
  descripcion: string;
}

export interface ZonaCandidataSiembra {
  hayZonas: boolean;
  descripcion: string;
}

export interface InterpretacionCaptura {
  coberturas: CoberturaVisual[];
  cultivosVisibles: string[];
  hallazgos: HallazgoVisual[];
  zonaCandidataSiembra: ZonaCandidataSiembra;
  recomendacion: string;
  confianza: Nivel;
}

export interface SintesisVuelo {
  resumen: string;
  hallazgosPrincipales: string[];
  zonasCandidatasSiembra: string;
  recomendaciones: string[];
  advertencias: string[];
}

export type EstadoInterpretacion = 'COMPLETADO' | 'PARCIAL' | 'SIN_RESULTADOS' | 'DESACTIVADO';

export interface ResumenInterpretacion {
  estado: EstadoInterpretacion;
  capturasInterpretadas: number;
  capturasConError: number;
  sintesis: SintesisVuelo | null;
  mensaje: string | null;
}
