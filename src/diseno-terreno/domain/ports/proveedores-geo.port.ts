import type { TipoCoberturaVisual } from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import { PuntoGeo } from '../value-objects/geo';
import { ObjetoTerreno } from '../value-objects/objetos-terreno';
import { Clima, Suelo } from '../value-objects/perfil-terreno.vo';

export interface ProveedorElevacionPort {
  readonly nombre: string;
  obtenerElevaciones(puntos: PuntoGeo[]): Promise<number[]>;
}

export interface ProveedorClimaPort {
  obtenerClima(punto: PuntoGeo, altitudM: number | null): Promise<Clima>;
}

export interface ProveedorSueloPort {
  obtenerSuelo(punto: PuntoGeo): Promise<Suelo>;
}

export interface ImagenSatelital {
  base64: string;
  fuente: string;
}

export interface ProveedorImagenSatelitalPort {
  disponible(): boolean;
  obtenerImagen(poligono: PuntoGeo[]): Promise<ImagenSatelital>;
}

export interface CoberturaInterpretada {
  porcentajes: Partial<Record<TipoCoberturaVisual, number>>;
  observaciones: string[];
}

export interface InterpreteCoberturaPort {
  interpretarImagenSatelital(imagenBase64: string): Promise<CoberturaInterpretada>;
}

export interface FuenteObjetosPort {
  obtenerObjetos(poligono: PuntoGeo[]): Promise<ObjetoTerreno[]>;
}

export interface ResultadoObjetos {
  objetos: ObjetoTerreno[];
  fallas: { fuente: string; mensaje: string }[];
}

export interface ProveedorObjetosPort {
  obtenerObjetos(poligono: PuntoGeo[]): Promise<ResultadoObjetos>;
}

export interface CuadriculaClasificada {
  filas: number;
  columnas: number;
  celdas: TipoCoberturaVisual[][];
}

export interface DetectorCuadriculaPort {
  clasificar(rutaImagen: string): Promise<CuadriculaClasificada>;
}

export const PROVEEDOR_ELEVACION_TOKEN = Symbol('PROVEEDOR_ELEVACION');
export const PROVEEDOR_CLIMA_TOKEN = Symbol('PROVEEDOR_CLIMA');
export const PROVEEDOR_SUELO_TOKEN = Symbol('PROVEEDOR_SUELO');
export const PROVEEDOR_IMAGEN_SATELITAL_TOKEN = Symbol('PROVEEDOR_IMAGEN_SATELITAL');
export const INTERPRETE_COBERTURA_TOKEN = Symbol('INTERPRETE_COBERTURA');
export const PROVEEDOR_OBJETOS_TOKEN = Symbol('PROVEEDOR_OBJETOS');
export const DETECTOR_CUADRICULA_TOKEN = Symbol('DETECTOR_CUADRICULA');
