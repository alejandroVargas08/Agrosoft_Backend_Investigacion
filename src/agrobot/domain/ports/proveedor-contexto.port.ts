import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';

export type FuenteContexto = 'sensores' | 'inventario' | 'drones' | 'finanzas' | 'plagas';

export interface ProveedorContextoPort {
  readonly fuente: FuenteContexto;
  obtener(usuario: UsuarioAutenticado): Promise<string>;
}

export const PERMISO_POR_FUENTE: Partial<Record<FuenteContexto, string>> = {
  inventario: 'inventario.ver',
  finanzas: 'finanzas.ver',
};

export const MENSAJE_SIN_ACCESO: Record<FuenteContexto, string> = {
  sensores: 'No tienes acceso a la información de sensores.',
  inventario: 'No tienes acceso a la información de inventario.',
  drones: 'No tienes acceso a la información de drones.',
  finanzas: 'No tienes acceso a la información de finanzas. Solo los administradores e instructores pueden consultarla.',
  plagas: 'No tienes acceso a la Wiki EPA.',
};

export const PROVEEDORES_CONTEXTO_TOKEN = 'PROVEEDORES_CONTEXTO_TOKEN';
